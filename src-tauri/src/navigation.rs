use tauri::Manager;

#[tauri::command]
pub async fn navigate_to_url(
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
pub async fn go_back(
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
pub async fn go_forward(
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
pub async fn reload_page(
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
