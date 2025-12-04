use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
async fn create_content_window(
    app: tauri::AppHandle,
    url: String,
) -> Result<String, String> {
    let window_id = uuid::Uuid::new_v4().to_string();
    let content_label = format!("content-{}", window_id);
    let app_handle = app.clone();

    // Create the content window (native WebView2 loading the actual URL)
    // Opens at center, fully resizable and draggable
    WebviewWindowBuilder::new(
        &app,
        &content_label,
        WebviewUrl::External(url.parse().map_err(|e| format!("Invalid URL: {:?}", e))?)
    )
    .title("Meikai Browser")
    .inner_size(1400.0, 800.0)
    .center() // Center on screen
    .resizable(true) // Fully resizable
    .decorations(false) // Use native window decorations
    .on_new_window(move |url, _features| {
        // Handle window.open() and target="_blank" requests
        let new_window_id = uuid::Uuid::new_v4().to_string();
        let new_label = format!("content-{}", new_window_id);
        let url_string = url.to_string();
        let app_for_window = app_handle.clone();
        let label_for_event = new_label.clone();
        
        // Clone app handle for the nested on_new_window handler
        let app_for_nested = app_for_window.clone();
        
        // Build the new window for the redirect link
        // Also add on_new_window handler so nested redirects work
        let builder = WebviewWindowBuilder::new(
            &app_for_window,
            &new_label,
            WebviewUrl::External(url.clone()),
        )
        .title("Meikai Browser")
        .inner_size(1400.0, 800.0)
        .center()
        .resizable(true)
        .decorations(false)
        .on_new_window(move |nested_url, _nested_features| {
            // Handle nested redirects recursively
            let nested_window_id = uuid::Uuid::new_v4().to_string();
            let nested_label = format!("content-{}", nested_window_id);
            let nested_url_string = nested_url.to_string();
            let nested_app = app_for_nested.clone();
            let nested_label_for_event = nested_label.clone();
            
            let nested_builder = WebviewWindowBuilder::new(
                &nested_app,
                &nested_label,
                WebviewUrl::External(nested_url.clone()),
            )
            .title("Meikai Browser")
            .inner_size(1400.0, 800.0)
            .center()
            .resizable(true)
            .decorations(false);
            
            match nested_builder.build() {
                Ok(window) => {
                    let _ = nested_app.emit("new-window-created", serde_json::json!({
                        "windowLabel": nested_label_for_event,
                        "url": nested_url_string
                    }));
                    tauri::webview::NewWindowResponse::Create { window }
                }
                Err(_) => tauri::webview::NewWindowResponse::Deny
            }
        });
        
        match builder.build() {
            Ok(window) => {
                // Emit event to frontend to track this new window
                let _ = app_for_window.emit("new-window-created", serde_json::json!({
                    "windowLabel": label_for_event,
                    "url": url_string
                }));
                
                tauri::webview::NewWindowResponse::Create { window }
            }
            Err(_) => {
                // If window creation fails, deny the request
                tauri::webview::NewWindowResponse::Deny
            }
        }
    })
    .build()
    .map_err(|e| e.to_string())?;

    // Return the window label so frontend can track it
    Ok(content_label)
}

#[tauri::command]
async fn navigate_to_url(
    app: tauri::AppHandle,
    window_label: String,
    url: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval(&format!("window.location.href = '{}'", url))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn go_back(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval("window.history.back()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn go_forward(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval("window.history.forward()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn reload_page(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.eval("window.location.reload()")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn close_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn minimize_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(&window_label) {
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
    if let Some(window) = app.get_webview_window(&window_label) {
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
    if let Some(window) = app.get_webview_window(&window_label) {
        // Use with_webview to access the WebView and get the URL
        let url = window.url().map_err(|e| e.to_string())?;
        Ok(url.to_string())
    } else {
        Err("Window not found".to_string())
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
            // Check if window still exists
            if let Some(window) = app_handle.get_webview_window(&label) {
                if let Ok(current_url) = window.url() {
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
            close_browser_window,
            minimize_browser_window,
            toggle_maximize_browser_window,
            get_current_url,
            setup_url_monitor
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
