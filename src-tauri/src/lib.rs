use tauri::{Emitter, Manager, WebviewUrl, LogicalPosition, LogicalSize};
use tauri::window::WindowBuilder;
use tauri::webview::WebviewBuilder;

const TITLE_BAR_HEIGHT: f64 = 40.0;
const WINDOW_WIDTH: f64 = 1400.0;
const WINDOW_HEIGHT: f64 = 800.0;

// Helper function to create a content window with multi-webview (title bar + content)
fn create_multi_webview_window(
    app: &tauri::AppHandle,
    window_label: &str,
    titlebar_label: &str,
    content_webview_label: &str,
    url: &str,
) -> Result<(), String> {
    // Create the window without decorations
    let window = WindowBuilder::new(app, window_label)
        .title("Meikai Browser")
        .inner_size(WINDOW_WIDTH, WINDOW_HEIGHT)
        .center()
        .resizable(true)
        .decorations(false)
        .build()
        .map_err(|e| e.to_string())?;

    // Get window size for positioning webviews
    let window_size = window.inner_size().map_err(|e| e.to_string())?;
    let width = window_size.width as f64;
    let height = window_size.height as f64;

    // Create title bar webview (loads from our React app with params)
    let encoded_url = urlencoding::encode(url);
    let titlebar_url = format!(
        "http://localhost:1420/titlebar?windowLabel={}&url={}",
        window_label, encoded_url
    );
    
    let titlebar_webview = WebviewBuilder::new(
        titlebar_label,
        WebviewUrl::External(titlebar_url.parse().map_err(|e| format!("Invalid titlebar URL: {:?}", e))?)
    );
    
    window.add_child(
        titlebar_webview,
        LogicalPosition::new(0.0, 0.0),
        LogicalSize::new(width, TITLE_BAR_HEIGHT),
    ).map_err(|e| e.to_string())?;

    // Clone app handle for on_new_window handler
    let app_for_handler = app.clone();
    
    // Create content webview (loads the external URL)
    let content_webview = WebviewBuilder::new(
        content_webview_label,
        WebviewUrl::External(url.parse().map_err(|e| format!("Invalid URL: {:?}", e))?)
    ).on_new_window(move |new_url, _features| {
        // Handle window.open() and target="_blank" requests
        let new_window_id = uuid::Uuid::new_v4().to_string();
        let new_window_label = format!("window-{}", new_window_id);
        let new_titlebar_label = format!("titlebar-{}", new_window_id);
        let new_content_label = format!("content-{}", new_window_id);
        let url_string = new_url.to_string();
        let app_clone = app_for_handler.clone();
        let label_for_event = new_content_label.clone();
        
        match create_multi_webview_window(
            &app_clone,
            &new_window_label,
            &new_titlebar_label,
            &new_content_label,
            &url_string,
        ) {
            Ok(_) => {
                // Emit event to frontend to track this new window
                let _ = app_clone.emit("new-window-created", serde_json::json!({
                    "windowLabel": label_for_event,
                    "url": url_string
                }));
                tauri::webview::NewWindowResponse::Deny
            }
            Err(_) => tauri::webview::NewWindowResponse::Deny
        }
    });
    
    window.add_child(
        content_webview,
        LogicalPosition::new(0.0, TITLE_BAR_HEIGHT),
        LogicalSize::new(width, height - TITLE_BAR_HEIGHT),
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn create_content_window(
    app: tauri::AppHandle,
    url: String,
) -> Result<String, String> {
    let window_id = uuid::Uuid::new_v4().to_string();
    let window_label = format!("window-{}", window_id);
    let titlebar_label = format!("titlebar-{}", window_id);
    let content_label = format!("content-{}", window_id);

    create_multi_webview_window(
        &app,
        &window_label,
        &titlebar_label,
        &content_label,
        &url,
    )?;

    // Return the content webview label so frontend can track it
    Ok(content_label)
}

#[tauri::command]
async fn navigate_to_url(
    app: tauri::AppHandle,
    window_label: String,
    url: String,
) -> Result<(), String> {
    // Use get_webview for child webviews in multi-webview architecture
    if let Some(webview) = app.get_webview(&window_label) {
        webview.eval(&format!("window.location.href = '{}'", url))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn go_back(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // Use get_webview for child webviews in multi-webview architecture
    if let Some(webview) = app.get_webview(&window_label) {
        webview.eval("window.history.back()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn go_forward(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // Use get_webview for child webviews in multi-webview architecture
    if let Some(webview) = app.get_webview(&window_label) {
        webview.eval("window.history.forward()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn reload_page(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // Use get_webview for child webviews in multi-webview architecture
    if let Some(webview) = app.get_webview(&window_label) {
        webview.eval("window.location.reload()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn show_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // The window_label is like "content-xxx", but the actual window is "window-xxx"
    // Derive the parent window label from the content webview label
    let parent_label = if window_label.starts_with("content-") {
        format!("window-{}", window_label.trim_start_matches("content-"))
    } else {
        window_label.clone()
    };
    
    if let Some(window) = app.get_window(&parent_label) {
        window.show().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn hide_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // The window_label is like "content-xxx", but the actual window is "window-xxx"
    // Derive the parent window label from the content webview label
    let parent_label = if window_label.starts_with("content-") {
        format!("window-{}", window_label.trim_start_matches("content-"))
    } else {
        window_label.clone()
    };
    
    if let Some(window) = app.get_window(&parent_label) {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn close_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // The window_label is like "content-xxx", but the actual window is "window-xxx"
    let parent_label = if window_label.starts_with("content-") {
        format!("window-{}", window_label.trim_start_matches("content-"))
    } else {
        window_label.clone()
    };
    
    if let Some(window) = app.get_window(&parent_label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn minimize_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // The window_label is like "content-xxx", but the actual window is "window-xxx"
    let parent_label = if window_label.starts_with("content-") {
        format!("window-{}", window_label.trim_start_matches("content-"))
    } else {
        window_label.clone()
    };
    
    if let Some(window) = app.get_window(&parent_label) {
        // Check if window is minimized
        let is_minimized = window.is_minimized().map_err(|e| e.to_string())?;

        if is_minimized {
            // Unminimize (restore) the window
            window.unminimize().map_err(|e| e.to_string())?;
        } else {
            // Minimize the window
            window.minimize().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn toggle_maximize_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    // The window_label is like "content-xxx", but the actual window is "window-xxx"
    let parent_label = if window_label.starts_with("content-") {
        format!("window-{}", window_label.trim_start_matches("content-"))
    } else {
        window_label.clone()
    };
    
    if let Some(window) = app.get_window(&parent_label) {
        // Check if window is maximized
        let is_maximized = window.is_maximized().map_err(|e| e.to_string())?;

        if is_maximized {
            // Unmaximize (restore) the window
            window.unmaximize().map_err(|e| e.to_string())?;
        } else {
            // Maximize the window
            window.maximize().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn get_current_url(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<String, String> {
    // Use get_webview for child webviews in multi-webview architecture
    if let Some(webview) = app.get_webview(&window_label) {
        let url = webview.url().map_err(|e| e.to_string())?;
        Ok(url.to_string())
    } else {
        Err("Webview not found".to_string())
    }
}

#[tauri::command]
async fn setup_url_monitor(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    let app_handle = app.clone();
    let label = window_label.clone();
    
    // Spawn a background task to monitor URL changes
    std::thread::spawn(move || {
        let mut last_url = String::new();
        
        loop {
            // Check if webview still exists (use get_webview for child webviews)
            if let Some(webview) = app_handle.get_webview(&label) {
                if let Ok(current_url) = webview.url() {
                    let url_string = current_url.to_string();
                    
                    // Only emit if URL has changed
                    if url_string != last_url {
                        last_url = url_string.clone();
                        
                        // Emit event to all windows (the main window will receive it)
                        let _ = app_handle.emit("url-changed", serde_json::json!({
                            "url": url_string,
                            "windowLabel": label
                        }));
                    }
                }
            } else {
                // Window was closed, stop monitoring
                break;
            }
            
            // Poll every 300ms (more efficient than frontend polling)
            std::thread::sleep(std::time::Duration::from_millis(300));
        }
    });
    
    Ok(())
}

// Title bar commands - these control the parent window from the title bar webview
#[tauri::command]
async fn titlebar_minimize(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
    // window_label is like "window-xxx", get the actual window
    if let Some(window) = app.get_window(&window_label) {
        window.minimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn titlebar_maximize(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
    if let Some(window) = app.get_window(&window_label) {
        let is_maximized = window.is_maximized().map_err(|e| e.to_string())?;
        if is_maximized {
            window.unmaximize().map_err(|e| e.to_string())?;
        } else {
            window.maximize().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn titlebar_close(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
    if let Some(window) = app.get_window(&window_label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn titlebar_drag(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
    if let Some(window) = app.get_window(&window_label) {
        window.start_dragging().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            create_content_window,
            navigate_to_url,
            go_back,
            go_forward,
            reload_page,
            show_browser_window,
            hide_browser_window,
            close_browser_window,
            minimize_browser_window,
            toggle_maximize_browser_window,
            get_current_url,
            setup_url_monitor,
            titlebar_minimize,
            titlebar_maximize,
            titlebar_close,
            titlebar_drag
        ])
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::Destroyed => {
                    let label = window.label().to_string();
                    // Emit for window- prefixed windows (multi-webview windows)
                    if label.starts_with("window-") {
                        // Extract the ID and emit with the content webview label
                        let id = label.trim_start_matches("window-");
                        let content_label = format!("content-{}", id);
                        let _ = window.emit("window-closed", serde_json::json!({
                            "windowLabel": content_label
                        }));
                    }
                }
                tauri::WindowEvent::Resized(size) => {
                    let label = window.label().to_string();
                    // Handle resize for multi-webview windows
                    if label.starts_with("window-") {
                        let id = label.trim_start_matches("window-");
                        let titlebar_label = format!("titlebar-{}", id);
                        let content_label = format!("content-{}", id);
                        
                        let width = size.width as f64;
                        let height = size.height as f64;
                        
                        // Update title bar webview bounds
                        if let Some(titlebar) = window.app_handle().get_webview(&titlebar_label) {
                            let _ = titlebar.set_bounds(tauri::Rect {
                                position: LogicalPosition::new(0.0, 0.0).into(),
                                size: LogicalSize::new(width, TITLE_BAR_HEIGHT).into(),
                            });
                        }
                        
                        // Update content webview bounds
                        if let Some(content) = window.app_handle().get_webview(&content_label) {
                            let _ = content.set_bounds(tauri::Rect {
                                position: LogicalPosition::new(0.0, TITLE_BAR_HEIGHT).into(),
                                size: LogicalSize::new(width, height - TITLE_BAR_HEIGHT).into(),
                            });
                        }
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
