use std::path::{PathBuf};
use std::fs::{File};

use anyhow::{Result};
use encoding_rs_io::{DecodeReaderBytesBuilder, DecodeReaderBytes};
use encoding_rs::WINDOWS_1252;
use csv::{StringRecord, Reader};
use serde::{Serialize, Deserialize};

pub use file_iterator::Files;

mod file_iterator;


#[derive(Debug, PartialEq, PartialOrd, Serialize, Deserialize, Copy, Clone)]
pub enum Status {
    SkipSerialize,
    Initial,
    FilesAvailable,
    ColsAvailable,
    Ready
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


pub fn get_header(path: &PathBuf) -> Result<StringRecord> {
    println!("Reading header for {:?}", path);
    let mut rdr = get_reader(path)?;

    let header = rdr.records() .next().unwrap()?;
    Ok(header)
}


pub fn get_reader(path: &PathBuf) -> Result<Reader<DecodeReaderBytes<File, Vec<u8>>>> {
    let file = File::open(path)?;

    let transcoded = DecodeReaderBytesBuilder::new()
        .encoding(Some(WINDOWS_1252))
        .build(file);

    Ok(csv::ReaderBuilder::new()
        .delimiter(b'\t')
        .flexible(true)
        .comment(Some(b'#'))
        .has_headers(false)
        .from_reader(transcoded))

}
