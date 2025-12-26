use tauri::{Emitter, Manager};

#[tauri::command]
pub async fn get_current_url(
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
pub async fn setup_url_monitor(
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
