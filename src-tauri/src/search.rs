/// Search suggestions using Google Suggest API
#[tauri::command]
pub fn get_search_suggestions(query: String) -> Result<Vec<String>, String> {
    if query.trim().is_empty() {
        return Ok(vec![]);
    }
    
    let encoded_query = urlencoding::encode(&query);
    let url = format!(
        "https://suggestqueries.google.com/complete/search?client=firefox&q={}",
        encoded_query
    );
    
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(3))
        .build()
        .map_err(|e| e.to_string())?;
    
    let response = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0")
        .send()
        .map_err(|e| e.to_string())?;
    
    let text = response.text().map_err(|e| e.to_string())?;
    
    // Google returns: ["query", ["suggestion1", "suggestion2", ...]]
    let parsed: serde_json::Value = serde_json::from_str(&text)
        .map_err(|e| e.to_string())?;
    
    let suggestions = parsed
        .get(1)
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .take(5) // Limit to 5 suggestions
                .collect::<Vec<String>>()
        })
        .unwrap_or_default();
    
    Ok(suggestions)
}
