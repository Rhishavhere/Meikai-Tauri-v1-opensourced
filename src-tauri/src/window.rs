use tauri::{Emitter, WebviewUrl, LogicalPosition, LogicalSize};
use tauri::window::WindowBuilder;
use tauri::webview::WebviewBuilder;

use crate::constants::{
    TITLE_BAR_HEIGHT, 
    WINDOW_WIDTH_PERCENT, 
    WINDOW_HEIGHT_PERCENT,
    FALLBACK_WINDOW_WIDTH,
    FALLBACK_WINDOW_HEIGHT
};

/// Helper function to create a content window with multi-webview (title bar + content)
pub fn create_multi_webview_window(
    app: &tauri::AppHandle,
    window_label: &str,
    titlebar_label: &str,
    content_webview_label: &str,
    url: &str,
) -> Result<(), String> {
    // Calculate window size as percentage of screen, with fallback
    let (window_width, window_height) = match app.primary_monitor() {
        Ok(Some(monitor)) => {
            let screen_size = monitor.size();
            (
                (screen_size.width as f64 * WINDOW_WIDTH_PERCENT).round(),
                (screen_size.height as f64 * WINDOW_HEIGHT_PERCENT).round()
            )
        }
        _ => (FALLBACK_WINDOW_WIDTH, FALLBACK_WINDOW_HEIGHT)
    };
    // Create the window without decorations
    let window = WindowBuilder::new(app, window_label)
        .title("Meikai Browser")
        .inner_size(window_width, window_height)
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
    
    // Valid for both dev (localhost) and build (tauri://)
    // We inject a script to set the route and params before the app loads
    let init_script = format!(
        "window.history.replaceState({{}}, '', '/titlebar?windowLabel={}&url={}');",
        window_label, encoded_url
    );

    let titlebar_webview = WebviewBuilder::new(
        titlebar_label,
        WebviewUrl::App("index.html".into())
    )
    .initialization_script(&init_script);
    
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
        // Check if this is an OAuth-related URL that needs native popup handling
        // OAuth flows require window.opener to communicate back to the parent
        let url_string = new_url.to_string();
        let is_oauth_url = url_string.contains("accounts.google.com") ||
                          url_string.contains("login.microsoftonline.com") ||
                          url_string.contains("facebook.com/login") ||
                          url_string.contains("facebook.com/v") ||
                          url_string.contains("appleid.apple.com") ||
                          url_string.contains("github.com/login/oauth") ||
                          url_string.contains("twitter.com/oauth") ||
                          url_string.contains("api.twitter.com") ||
                          url_string.contains("oauth") ||
                          url_string.contains("authorize") ||
                          url_string.contains("signin") ||
                          url_string.contains("auth/");
        
        if is_oauth_url {
            // Let the WebView handle OAuth popups natively to maintain window.opener
            // This is required for OAuth flows to work properly
            tauri::webview::NewWindowResponse::Allow
        } else {
            // Handle regular window.open() and target="_blank" requests with our custom window
            let new_window_id = uuid::Uuid::new_v4().to_string();
            let new_window_label = format!("window-{}", new_window_id);
            let new_titlebar_label = format!("titlebar-{}", new_window_id);
            let new_content_label = format!("content-{}", new_window_id);
            let app_clone = app_for_handler.clone();
            let label_for_event = new_content_label.clone();
            let url_for_window = url_string.clone();
            
            match create_multi_webview_window(
                &app_clone,
                &new_window_label,
                &new_titlebar_label,
                &new_content_label,
                &url_for_window,
            ) {
                Ok(_) => {
                    // Emit event to frontend to track this new window
                    let _ = app_clone.emit("new-window-created", serde_json::json!({
                        "windowLabel": label_for_event,
                        "url": url_for_window
                    }));
                    tauri::webview::NewWindowResponse::Deny
                }
                Err(_) => tauri::webview::NewWindowResponse::Deny
            }
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
pub async fn create_content_window(
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
