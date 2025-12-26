use tauri::Manager;

/// Title bar commands - these control the parent window from the title bar webview

#[tauri::command]
pub async fn titlebar_minimize(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
    // window_label is like "window-xxx", get the actual window
    if let Some(window) = app.get_window(&window_label) {
        window.minimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn titlebar_maximize(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
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
pub async fn titlebar_close(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
    if let Some(window) = app.get_window(&window_label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn titlebar_drag(app: tauri::AppHandle, window_label: String) -> Result<(), String> {
    if let Some(window) = app.get_window(&window_label) {
        window.start_dragging().map_err(|e| e.to_string())?;
    }
    Ok(())
}
