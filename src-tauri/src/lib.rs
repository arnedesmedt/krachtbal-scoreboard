// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_mac_address() -> String {
    mac_address::get_mac_address()
        .ok()
        .flatten()
        .map(|ma| ma.to_string())
        .unwrap_or_default()
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_mac_address])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

