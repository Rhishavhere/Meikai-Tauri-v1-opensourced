use tauri::{Emitter, Manager, LogicalPosition, LogicalSize, PhysicalSize};

mod constants;
mod window;
mod navigation;
mod window_controls;
mod url_monitor;
mod titlebar;
mod search;

use constants::{
    TITLE_BAR_HEIGHT,
    PANEL_WIDTH_PERCENT,
    PANEL_HEIGHT_PERCENT,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Resize main window to percentage-based size BEFORE React loads
            // This eliminates the size flash that would occur if done in React
            if let Some(main_window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = main_window.primary_monitor() {
                    let screen_size = monitor.size();
                    let panel_width = (screen_size.width as f64 * PANEL_WIDTH_PERCENT).round() as u32;
                    let panel_height = (screen_size.height as f64 * PANEL_HEIGHT_PERCENT).round() as u32;
                    
                    let _ = main_window.set_size(PhysicalSize::new(panel_width, panel_height));
                    let _ = main_window.center();
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            window::create_content_window,
            navigation::navigate_to_url,
            navigation::go_back,
            navigation::go_forward,
            navigation::reload_page,
            window_controls::show_browser_window,
            window_controls::hide_browser_window,
            window_controls::close_browser_window,
            window_controls::minimize_browser_window,
            window_controls::toggle_maximize_browser_window,
            url_monitor::get_current_url,
            url_monitor::setup_url_monitor,
            titlebar::titlebar_minimize,
            titlebar::titlebar_maximize,
            titlebar::titlebar_close,
            titlebar::titlebar_drag,
            search::get_search_suggestions
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
