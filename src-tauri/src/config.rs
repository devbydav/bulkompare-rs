use std::fs;
use std::path::{PathBuf, Path};

use serde_json;
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[cfg(feature = "custom_actions")]
use crate::custom_actions::CustomConfig;


#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Config {
    #[cfg(feature = "custom_actions")]
    pub custom: Option<CustomConfig>
}


impl Config {

    pub fn imported(config_dir: &PathBuf) -> Self {
        let mut config = read_config(config_dir).unwrap_or_else(|e| {
            println!("Error reading config file, default values are used ({})", e);
            Config::default()
        });

        #[cfg(feature = "custom_actions")]
        if let Some(ref mut custom) = config.custom {
            custom.finish().unwrap();
        }

        config
    }

}


fn read_config(config_dir: &Path) -> Result<Config> {
    let config_bytes = fs::read(config_dir.join("config.json"))?;
    let config: Config = serde_json::from_slice(&config_bytes)?;

    Ok(config)
}