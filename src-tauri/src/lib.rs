use serde::Serialize;

pub use comparator::{Comparator, ComparatorResult};
pub use helpers::Status;
pub use selection::Selection;

mod comparator;
mod csv_set;
mod helpers;
mod selection;

#[derive(Serialize)]
pub struct StringError(Option<String>);

impl From<anyhow::Error> for StringError {
    fn from(e: anyhow::Error) -> Self {
        StringError(Some(format!("Erreur: {:#}", e)))
    }
}

impl StringError {
    pub fn none() -> Self {
        StringError(None)
    }

    pub fn add_error(&mut self, error: anyhow::Error, extension: &str) {
        // Add to list of errors
        self.0 = match &mut self.0 {
            None => Some(format!("[{}] {:#}", extension, error)),
            Some(prev) => Some(format!("{} / [{}] {:#}", prev, extension, error)),
        }
    }
}
