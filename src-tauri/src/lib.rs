use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
async fn create_content_window(
    app: tauri::AppHandle,
    url: String,
) -> Result<String, String> {
    let window_id = uuid::Uuid::new_v4().to_string();
    let content_label = format!("content-{}", window_id);

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
            toggle_maximize_browser_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
