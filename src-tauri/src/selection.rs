use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::comparator::Comparator;

#[derive(Serialize, Deserialize)]
pub struct Selection {
    pub selected: i32,
    pub names: Vec<String>,
    pub dirs: Vec<PathBuf>,
    pub comparators: Vec<Comparator>,
}
