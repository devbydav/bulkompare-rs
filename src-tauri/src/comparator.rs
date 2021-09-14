use std::cmp::Ordering;
use std::path::Path;

use serde::{Serialize, Deserialize};
use anyhow::{Context, Result};

use crate::csv_set::CsvSet;
use crate::helpers::{Comparison, Line, Columns, Status};


#[derive(Debug, Serialize, Deserialize)]
pub struct DifferentLine {
    index: String,
    display_values: Vec<String>,
    differences: Vec<Difference>
}


#[derive(Debug, Serialize, Deserialize)]
pub struct Difference {
    col: String,
    left: String,
    right: String,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct ComparatorResult {
    in_one: String,
    not_compared: String,
    differences: Vec<DifferentLine>,
    display_cols: Vec<String>
}


#[derive(Serialize, Deserialize)]
pub struct Comparator {
    pub ext: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<Status>,
    pub available_cols: Vec<String>,
    pub index_cols: Vec<String>,
    pub compare_cols: Vec<String>,
    pub display_cols: Vec<String>,
    pub csv_sets: Vec<CsvSet>,
    #[serde(skip)]
    pub lines_left: Vec<Line>,
    #[serde(skip)]
    pub lines_right: Vec<Line>,
}


impl Comparator {
    pub fn read_headers(&mut self, directories: Vec<&Path>) -> Result<()> {
        println!("Comparator reading headers ...");

        let headers: Result<Vec<Vec<String>>> = self.csv_sets
            .iter()
            .zip(directories)
            .map(|(csv_set, directory)| {
                csv_set.get_headers(&directory, &self.ext)
            })
            .collect();

        let mut headers = headers?;
        let headers_right = headers.pop().unwrap();
        let headers_left = headers.pop().unwrap();

        // Headers that are in both datasets
        self.available_cols = headers_left
            .into_iter()
            .filter(|ext_l| headers_right.iter().any(|ext_r| ext_l == ext_r))
            .collect();

        // println!("Available headers : {:?}", self.available_cols);

        Ok(())
    }


    pub fn compare(&mut self, directories: Vec<&Path>) -> Result<ComparatorResult> {
        println!("Comparator comparing ...");
        let mut differences = Vec::new();

        let columns = Columns {
            index: &self.index_cols,
            compare: &self.compare_cols,
            display: &self.display_cols
        };

        self.lines_left = self.csv_sets[0].get_lines(&columns, directories[0], &self.ext)?;
        self.lines_right = self.csv_sets[1].get_lines(&columns, directories[1], &self.ext)?;


        let mut iter_left = self.lines_left.iter_mut()
            .filter(|line| line.result != Comparison::DuplicatedIndex);
        let mut line_left = iter_left.next()
            .context("Left dataset is empty")?;

        let mut iter_right = self.lines_right.iter_mut()
            .filter(|line| line.result != Comparison::DuplicatedIndex);
        let mut line_right = iter_right.next()
            .context("Right dataset is empty")?;


        loop {
            match line_left.index.cmp(&line_right.index) {
                Ordering::Equal => {
                    // Found unique index match (duplicated are skipped) -> compare
                    if check_values_are_identical(&self.compare_cols, line_left, line_right, &mut differences) {
                        line_left.result = Comparison::Identical;
                        line_right.result = Comparison::Identical;
                    } else {
                        line_left.result = Comparison::Different;
                        line_right.result = Comparison::Different;
                    }

                    // Get next lines and consider end of iteration
                    match (iter_left.next(), iter_right.next()) {
                        (Some(next_left), Some(next_right)) => {
                            line_left = next_left;
                            line_right = next_right;
                        },
                        (Some(next_left), None) => {
                            next_left.result = Comparison::InOneOnly;
                            break;
                        },
                        (None, Some(next_right)) => {
                            next_right.result = Comparison::InOneOnly;
                            break;
                        },
                        (None, None) => {
                            break;
                        },
                    }
                },

                Ordering::Less => {
                    // Right is greater -> no match for current left, look at next left with current right
                    line_left.result = Comparison::InOneOnly;
                    match iter_left.next() {
                        Some(next_left) => line_left = next_left,
                        None => break,
                    }
                },

                Ordering::Greater => {
                    // Left is greater -> no match for current right, look at next right with current left
                    line_right.result = Comparison::InOneOnly;
                    match iter_right.next() {
                        Some(next_right) => line_right = next_right,
                        None => break,
                    }

                }
            }
        }

        while let Some(line) = iter_left.next() {
            line.result = Comparison::InOneOnly
        }

        while let Some(line) = iter_right.next() {
            line.result = Comparison::InOneOnly
        }


        let r = ComparatorResult {
            in_one: "".to_string(),
            not_compared: "".to_string(),
            differences,
            display_cols: self.display_cols.clone()
        };
        Ok(r)
    }

}


fn check_values_are_identical(
    compare_cols: &Vec<String>,
    left: &mut Line,
    right: &mut Line,
    differences: &mut Vec<DifferentLine>
) -> bool {
    let mut identical = true;
    let mut different_line = None;

    for (i, (left_val, right_val)) in left.compare
        .iter()
        .zip(&right.compare)
        .enumerate()
    {
        if left_val != right_val {
            identical = false;
            if different_line.is_none() {
                different_line = Some(DifferentLine {
                    index: left.index.join("-"),
                    display_values: left.display.clone(),
                    differences: vec![]
                })
            }


            different_line.as_mut().unwrap().differences.push(
                Difference {
                    col: compare_cols[i].clone(),
                    left: left_val.clone(),
                    right: right_val.clone(),
                }
            );
        }
    }

    if let Some(different_line) = different_line {
        differences.push(different_line);
    }
    identical
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {

    }
}
