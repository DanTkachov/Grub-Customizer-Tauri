// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
pub mod paths;
use paths::path::{current_theme, change_theme, get_paths, sudo_update_grub};

#[tauri::command]
fn log(message: &str) -> String{
    format!("{}", message)
}

#[tauri::command]
fn list_themes() -> Vec<String>{
    // This will return a string as such:
    // [theme_name, image_path_of_prev_entry, theme_name, etc etc]
    // thats why in the main.js file, i do i%2 for the buttons
    let mut res : Vec<String> = Vec::new();
    let themes = get_paths(); // this returns a Vec<Thumbnail>
    for theme in themes {
        res.push(theme.path);
        res.push(theme.thumbnail_path);
    }
    res
}

#[tauri::command]
fn change_theme_to_selected(theme: String) -> Result<(), String>{
    match change_theme(theme){
        Ok(_) => (),
        Err(e) => {
            println!("{}", format!("change_theme_to_selected error - change_theme failed: {}", e));
            return Err(format!("change_theme_to_selected error - change_theme failed: {}", e))
        }
    };
    match sudo_update_grub(){
        Ok(_) => (),
        Err(e) => {
            println!("{}", format!("change_theme_to_selected error - sudo_update_grub failed: {}", e));
            return Err(format!("change_theme_to_selected error - sudo_update_grub failed: {}", e));
        }
    };
    Ok(())
}

#[tauri::command]
fn current_installed_theme() -> String{
    let current_theme = current_theme();
    current_theme.unwrap()
}

#[tauri::command]
fn load_image(path: String) -> tauri::Result<String> {
    use std::fs::read;
    use base64::encode;

    let bytes = read(path)?;
    let encoded = encode(&bytes);
    Ok(format!("data:image/png;base64,{}", encoded))
}


fn main() {
    // run using "sass src/styles.scss src/styles.css && cargo tauri dev
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![log, list_themes, current_installed_theme, change_theme_to_selected, load_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}
