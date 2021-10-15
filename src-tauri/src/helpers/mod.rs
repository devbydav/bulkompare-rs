use serde::{Serialize, Deserialize};
use serde_repr::{Serialize_repr, Deserialize_repr};

pub use file_iterator::Files;

mod file_iterator;


#[derive(Serialize_repr, Deserialize_repr, Debug, PartialEq, PartialOrd, Copy, Clone)]
#[repr(i8)]
pub enum Status {
    SkipSerialize = -1,
    Initial = 0,
    FilesAvailable = 1,
    ColsAvailable = 2,
    Ready = 3
}


#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub enum Comparison {
    None,
    Identical,
    Different,
    InOneOnly,
    DuplicatedIndex,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct Line {
    pub index: Vec<String>,
    pub compare: Vec<String>,
    pub display: Vec<String>,
    pub result: Comparison,
}


pub struct Columns<'a> {
    pub index: &'a Vec<String>,
    pub compare: &'a Vec<String>,
    pub display: &'a Vec<String>,
}
