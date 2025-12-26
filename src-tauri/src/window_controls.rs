use tauri::Manager;

/// Derive the parent window label from the content webview label
fn get_parent_window_label(window_label: &str) -> String {
    if window_label.starts_with("content-") {
        format!("window-{}", window_label.trim_start_matches("content-"))
    } else {
        window_label.to_string()
    }
}

#[tauri::command]
pub async fn show_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    let parent_label = get_parent_window_label(&window_label);
    
    if let Some(window) = app.get_window(&parent_label) {
        window.show().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn hide_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    let parent_label = get_parent_window_label(&window_label);
    
    if let Some(window) = app.get_window(&parent_label) {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn close_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    let parent_label = get_parent_window_label(&window_label);
    
    if let Some(window) = app.get_window(&parent_label) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn minimize_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    let parent_label = get_parent_window_label(&window_label);
    
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
pub async fn toggle_maximize_browser_window(
    app: tauri::AppHandle,
    window_label: String,
) -> Result<(), String> {
    let parent_label = get_parent_window_label(&window_label);
    
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
