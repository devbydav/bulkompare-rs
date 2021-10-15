use std::fs::File;
use std::path::{Path, PathBuf};

use anyhow::{Result, Context};
use serde::{Serialize, Deserialize};
use encoding_rs_io::{DecodeReaderBytesBuilder, DecodeReaderBytes};
use encoding_rs::WINDOWS_1252;
use csv::{StringRecord, Reader};

use crate::helpers::{Files, Comparison, Columns, Line};


#[derive(Serialize, Deserialize)]
pub struct CsvSet {
    pub encoding: String,
    pub comment: String,
    pub skip_blank_lines: bool,
    pub header: u8,
    pub separator: String,
    pub strip: bool,
    pub ignore_whitespace: bool,
}


impl CsvSet {

    /// Returns the column that are present in all files of the set
    pub fn common_cols(&self, directory: &Path, ext: &str) -> Result<Vec<String>> {

        let mut files = Files::new(directory, ext)?;

        let first_header_record = self.csv_header(&files.next().context("Empty")?)?;
        let mut header: Vec<&str> = first_header_record.iter().collect();

        // for every next file
        for file in files {
            // println!("For loop {:?}", file);
            let new_header_record = self.csv_header(&file)?;
            header = header.into_iter()
                .filter(|e| {
                    new_header_record
                        .iter()
                        .any(|ne|ne == *e) })
                .collect();
        }

        Ok(header.iter().map(|e|e.to_string()).collect())
    }


    /// Reads all lines
    pub fn get_lines(&self, columns: &Columns, directory: &Path, ext: &str) -> Result<Vec<Line>> {

        let files = Files::new(directory, ext)?;
        let mut lines = self.read_csv(columns, files)?;
        lines.sort_unstable_by(|a, b| a.index.cmp(&b.index));

        if lines.len() == 0 {
            println!("No line !");
            return Ok(vec![]);
        }

        for i in 0..lines.len() - 1 {
            if lines[i].index == lines[i+1].index {
                // println!("EQUAL!");
                lines[i].result = Comparison::DuplicatedIndex;
                lines[i+1].result = Comparison::DuplicatedIndex;
            }
        }

        Ok(lines)
    }

    /// Returns a reader for path
    fn csv_reader(&self, path: &PathBuf) -> Result<Reader<DecodeReaderBytes<File, Vec<u8>>>> {
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

    /// Returns the header of a csv file
    fn csv_header(&self, path: &PathBuf) -> Result<StringRecord> {
        println!("Reading header for {:?}", path);
        let mut rdr = self.csv_reader(path)?;

        let header = rdr.records() .next().unwrap()?;
        Ok(header)
    }


    fn read_csv(&self, cols: &Columns, files: Files) -> Result<Vec<Line>> {
        println!("CsvSet read_csv");

        let mut lines = Vec::new();

        for path in files {
            let mut reader = self.csv_reader(&path)?;
            let header = reader.records().next().unwrap()?;

            // Get the column indices in this file
            let index_indices: Vec<usize> = cols.index
                .iter()
                .map(|col| header.iter().position(|e| e==col).unwrap())
                .collect();

            let compare_indices: Vec<usize> = cols.compare
                .iter()
                .map(|col| header.iter().position(|e| e==col).unwrap())
                .collect();

            let display_indices: Vec<usize> = cols.display
                .iter()
                .map(|col| header.iter().position(|e| e==col).unwrap())
                .collect();

            // println!("Index selection: {:?}", cols.index);
            // println!("Index indices  : {:?}", index_indices);

            for result in reader.records() {
                let record = result?;

                lines.push(Line {
                    index: index_indices
                        .iter()
                        .map(|i| record.get(*i).unwrap().to_string())
                        .collect(),
                    compare: compare_indices
                        .iter()
                        .map(|i| record.get(*i).unwrap().to_string())
                        .collect(),
                    display: display_indices
                        .iter()
                        .map(|i| record.get(*i).unwrap().to_string())
                        .collect(),
                    result: Comparison::None
                });

            }
        }

        Ok(lines)
    }

}


