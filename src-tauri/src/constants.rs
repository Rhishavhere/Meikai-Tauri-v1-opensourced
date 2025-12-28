/// Height of the custom title bar in pixels
pub const TITLE_BAR_HEIGHT: f64 = 20.0;

/// Content browser window - width as percentage of screen, height from 7:4 aspect ratio
pub const WINDOW_WIDTH_PERCENT: f64 = 0.73;
pub const WINDOW_ASPECT_RATIO: (f64, f64) = (7.0, 4.0); // width:height = 7:4

/// Main panel window - width as percentage of screen, height from 3:2 aspect ratio
pub const PANEL_WIDTH_PERCENT: f64 = 0.47;
pub const PANEL_ASPECT_RATIO: (f64, f64) = (3.0, 2.0); // width:height = 3:2

/// Fallback window width in pixels (used if monitor detection fails)
pub const FALLBACK_WINDOW_WIDTH: f64 = 1400.0;

/// Fallback window height in pixels (used if monitor detection fails)
pub const FALLBACK_WINDOW_HEIGHT: f64 = 800.0;
