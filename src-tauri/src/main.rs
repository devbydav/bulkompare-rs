#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

#[macro_use]
extern crate lazy_static;

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use serde::Serialize;
use anyhow::Context;

use comparator::ComparatorResult;
use selection::Selection;
use comparator::Comparator;
use config::Config;

#[cfg(feature = "custom_actions")]
use custom_actions::custom_on_click_result_leaf;


mod selection;
mod comparator;
mod helpers;
mod csv_set;
mod config;

#[cfg(feature = "custom_actions")]
mod custom_actions;


lazy_static! {
    static ref CONFIG_DIR: PathBuf = {
        // current dir in debug, exe dir in release
        if cfg!(debug_assertions) {
            let current_dir = std::env::current_dir().unwrap();
            current_dir.join("config")
        } else {
            let current_exe = std::env::current_exe().unwrap();
            current_exe.parent().unwrap().join("config")
        }
    };

    static ref CONFIG: Config = {
        Config::imported(&CONFIG_DIR)
    };
}


#[derive(Serialize)]
struct StringError(String);


impl From<anyhow::Error> for StringError {
    fn from(e: anyhow::Error) -> Self {
        StringError(format!("Erreur: {:#}", e))
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_headers,
            compare,
            open_selection,
            save_selection,
            on_click_result_leaf,
      ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn read_headers(
    mut comparator: Comparator,
    directories: Vec<PathBuf>
) -> Result<Comparator, StringError> {
    println!("-> read_headers command");

    let directories_refs = directories.iter().map(|pb| pb.as_ref()).collect();
    comparator.read_headers(directories_refs)?;
    println!("{}", comparator.ext);

    Ok(comparator)
}


#[tauri::command]
async fn compare(selection: Selection) -> Result<HashMap<String, ComparatorResult>, StringError> {
    println!("-> compare command");

    let mut diffs = HashMap::new();

    for mut comparator in selection.comparators {
        let directories_refs = selection.dirs.iter().map(|pb| pb.as_ref()).collect();
        let res = comparator.compare(directories_refs)?;
        diffs.insert(comparator.ext.clone(), res);
    }

    Ok(diffs)
}


#[tauri::command]
fn open_selection(path: PathBuf) -> Result<Selection, StringError> {
    println!("-> open_selection command");

    let s = fs::read_to_string(path).context("Reading selection")?;
    let selection: Selection = serde_json::from_str(&s).context("Parsing selection")?;
    Ok(selection)
}


#[tauri::command]
fn save_selection(path: PathBuf, selection: Selection) -> Result<(), StringError> {
    println!("-> save_selection command");

    let j = serde_json::to_string_pretty(&selection)
        .context("serialization")?;
    fs::write(path, j).context("writing selection")?;
    Ok(())
}


#[tauri::command]
fn on_click_result_leaf(
    col_names: Vec<String>,
    col_values: Vec<String>,
    file_extension: String,
) -> Result<(), StringError> {
    println!("-> click_result_leaf");


    #[cfg(feature = "custom_actions")]
    custom_on_click_result_leaf(col_names, col_values, file_extension)?;

    #[cfg(not(feature = "custom_actions"))]
    {
        println!("{}\n{:?}\n{:?}", file_extension, col_names, col_values);
    }

    Ok(())
}