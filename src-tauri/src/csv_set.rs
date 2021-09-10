use std::path::Path;

use anyhow::{Result, Context};
use serde::{Serialize, Deserialize};

use crate::helpers::{Files, get_header, Comparison, Columns, get_reader, Line};


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

    pub fn get_headers(&self, directory: &Path, ext: &str) -> Result<Vec<String>> {

        let mut files = Files::new(directory, ext)?;

        let first_header_record = get_header(&files.next().context("Empty")?)?;
        let mut header: Vec<&str> = first_header_record.iter().collect();

        // for every next file
        for file in files {
            // println!("For loop {:?}", file);
            let new_header_record = get_header(&file)?;
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


    fn read_csv(&self, cols: &Columns, files: Files) -> Result<Vec<Line>> {
        println!("CsvSet read_csv");

        let mut lines = Vec::new();

        for path in files {
            let mut reader = get_reader(&path)?;
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


