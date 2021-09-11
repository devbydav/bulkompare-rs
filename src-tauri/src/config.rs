use std::fs;
use std::path::{PathBuf, Path};

use serde_json;
use serde::{Deserialize, Serialize};
use anyhow::Result;


#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Config {
    pub item: u8,
}


impl Config {

    pub fn imported(config_dir: &PathBuf) -> Self {
        read_config(config_dir).unwrap_or_else(|e| {
            println!("Error reading config file, default values are used ({})", e);
            Config::default()
        })
    }

}


fn read_config(config_dir: &Path) -> Result<Config> {
    let config_bytes = fs::read(config_dir.join("config.json"))?;
    let config: Config = serde_json::from_slice(&config_bytes)?;

    Ok(config)
}