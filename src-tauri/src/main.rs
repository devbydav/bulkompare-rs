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
use helpers::Status;

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
struct StringError(Option<String>);


impl From<anyhow::Error> for StringError {
    fn from(e: anyhow::Error) -> Self {
        StringError(Some(format!("Erreur: {:#}", e)))
    }
}

impl StringError {
    fn none() -> Self {
        StringError(None)
    }

    fn add_error(&mut self, error: anyhow::Error) {
        // Add to list of errors
        self.0 = match &mut self.0 {
            None => Some(error.to_string()),
            Some(prev) => {
                Some(format!("{} / {}", prev, error))
            }
        }
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            update_selection_status,
            update_comparator_status,
            compare,
            open_selection,
            save_selection,
            on_click_result_leaf,
      ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn update_selection_status(
    mut selection: Selection,
    max_status_before: Status,
    min_status_after: Status
) -> (Selection, StringError) {
    println!("-> update_selection_status command with min {:?}", &min_status_after);

    let mut errors = StringError::none();

    for comparator in &mut selection.comparators {
        if let Err(e) = comparator
            .update_status(max_status_before, min_status_after, &selection.dirs) {

            errors.add_error(e);
        }
    }

    (selection, errors)
}


#[tauri::command]
fn update_comparator_status(
    mut comparator: Comparator,
    directories: Vec<PathBuf>,
    max_status_before: Status,
    min_status_after: Status
) -> (Comparator, StringError) {
    println!("-> update_comparator_status command with min {:?}", &min_status_after);

    match comparator.update_status(max_status_before, min_status_after, &directories) {
        Ok(()) => (comparator, StringError::none()),
        Err(e) => (comparator, e.into())
    }

}


#[tauri::command]
async fn compare(selection: Selection) -> Result<HashMap<String, ComparatorResult>, StringError> {
    println!("-> compare command");

    let mut diffs = HashMap::new();

    for mut comparator in selection.comparators {
        let res = comparator.compare(&selection.dirs)?;
        diffs.insert(comparator.ext.clone(), res);
    }

    Ok(diffs)
}


#[tauri::command]
fn open_selection(path: PathBuf) -> Result<Selection, StringError> {
    println!("-> open_selection command");

    let s = fs::read_to_string(path).context("Reading selection")?;
    let mut selection: Selection = serde_json::from_str(&s).context("Parsing selection")?;

    // Force status to Initial
    for comparator in &mut selection.comparators {
        comparator.status = Status::Initial;
    }

    Ok(selection)
}


#[tauri::command]
fn save_selection(path: PathBuf, mut selection: Selection) -> Result<(), StringError> {
    println!("-> save_selection command");

     // Force status to None to skip serializing
    for comparator in &mut selection.comparators {
        comparator.status = Status::SkipSerialize;
        comparator.available_cols = vec![];
    }

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
) -> Result<String, StringError> {
    println!("-> click_result_leaf");


    #[cfg(feature = "custom_actions")]
    {
        custom_on_click_result_leaf(col_names, col_values, file_extension)
            .map_err(|e| e.into())
    }

    #[cfg(not(feature = "custom_actions"))]
    {
        println!("{}\n{:?}\n{:?}", file_extension, col_names, col_values);
        Ok("".to_string())
    }

}