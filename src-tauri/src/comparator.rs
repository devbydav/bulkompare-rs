use std::cmp::Ordering;
use std::collections::HashMap;
use std::path::PathBuf;

use anyhow::{bail, ensure, Context, Result};
use serde::{Deserialize, Serialize};

use crate::csv_set::CsvSet;
use crate::helpers::{Columns, Comparison, Files, Line, Status};

#[derive(Debug, Serialize, Deserialize)]
pub struct Summary {
    diffs: usize,
    in_one: Vec<usize>,
    not_compared: Vec<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Difference {
    id: usize,
    _rowkey: String,
    _col: String,
    _from: String,
    _to: String,

    #[serde(flatten)]
    display: HashMap<String, String>,
}

#[derive(Debug, Serialize)]
pub struct ComparatorResult {
    summary: Summary,
    in_one: Vec<HashMap<String, String>>,
    not_compared: Vec<HashMap<String, String>>,
    differences: Vec<Difference>,
    display_cols: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Comparator {
    pub ext: String,
    #[serde(default = "default_status_deserialization")]
    #[serde(skip_serializing_if = "skip_status_serialization")]
    pub status: Status,
    pub available_cols: Vec<String>,
    pub key_cols: Vec<String>,
    pub compare_cols: Vec<String>,
    pub display_cols: Vec<String>,
    pub csv_sets: Vec<CsvSet>,
    #[serde(skip)]
    pub lines_left: Vec<Line>,
    #[serde(skip)]
    pub lines_right: Vec<Line>,
}

fn default_status_deserialization() -> Status {
    Status::Initial
}

fn skip_status_serialization(status: &Status) -> bool {
    *status == Status::SkipSerialize
}

impl Comparator {
    /// Makes sure each directory has at least 1 file with desired extension
    pub fn update_status(
        &mut self,
        max_status_before: Status,
        min_status_after: Status,
        directories: &[PathBuf],
    ) -> Result<()> {
        // status is max_status_before at most
        if self.status > max_status_before {
            self.status = max_status_before;
        }

        if self.status < Status::FilesAvailable {
            println!(
                "Try update {} from {:?} to FilesAvailable",
                self.ext, self.status
            );
            match self.files_available(directories) {
                Err(e) if min_status_after >= Status::FilesAvailable => bail!(e),
                Err(_) => return Ok(()),
                Ok(()) => self.status = Status::FilesAvailable,
            }
        }

        if self.status < Status::ColsAvailable {
            println!(
                "Try update {} from {:?} to ColsAvailable",
                self.ext, self.status
            );
            match self.read_headers(directories) {
                Err(e) if min_status_after >= Status::ColsAvailable => bail!(e),
                Err(_) => return Ok(()),
                Ok(()) => self.status = Status::ColsAvailable,
            }
        }

        if self.status < Status::Ready {
            println!("Try update {} from {:?} to Ready", self.ext, self.status);
            match self.check_selected_columns() {
                Err(e) if min_status_after >= Status::Ready => bail!(e),
                Err(_) => return Ok(()),
                Ok(()) => self.status = Status::Ready,
            }
        }

        Ok(())
    }

    /// Makes sure each directory has at least 1 file with desired extension
    pub fn files_available(&mut self, directories: &[PathBuf]) -> Result<()> {
        for directory in directories.iter().take(2) {
            let mut files = Files::new(directory, &self.ext)?;
            files.next().with_context(|| {
                format!("Aucun fichier {} dans {}", self.ext, directory.display())
            })?;
        }

        Ok(())
    }

    pub fn read_headers(&mut self, directories: &[PathBuf]) -> Result<()> {
        println!("Comparator reading headers ...");

        let headers: Result<Vec<Vec<String>>> = self
            .csv_sets
            .iter()
            .zip(directories)
            .map(|(csv_set, directory)| csv_set.common_cols(directory, &self.ext))
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
        ensure!(
            !self.available_cols.is_empty(),
            "Aucune colonne commune aux fichiers"
        );

        // Clear invalid selected columns
        self.key_cols = self.clear_unavailable_cols(&self.key_cols);
        self.compare_cols = self.clear_unavailable_cols(&self.compare_cols);
        self.display_cols = self.clear_unavailable_cols(&self.display_cols);

        Ok(())
    }

    /// Returns selection columns that are available in the data set
    fn clear_unavailable_cols(&self, selection: &[String]) -> Vec<String> {
        selection
            .iter()
            .filter_map(|old_col| {
                if self.available_cols.contains(old_col) {
                    Some(old_col.clone())
                } else {
                    None
                }
            })
            .collect()
    }

    fn check_selected_columns(&mut self) -> Result<()> {
        // Check that some columns are selected
        ensure!(
            !self.key_cols.is_empty(),
            "Aucune colonne clé sélectionnée"
        );
        ensure!(
            !self.compare_cols.is_empty(),
            "Aucune colonne à comparer sélectionnée"
        );
        ensure!(
            !self.display_cols.is_empty(),
            "Aucune colonne à afficher sélectionnée"
        );

        // It doesn't make sense to compare columns selected for key
        ensure!(
            !self
                .key_cols
                .iter()
                .any(|key_col| self.compare_cols.contains(key_col)),
            "Certaines colonnes sont sélectionnées en clé et comparaison"
        );

        Ok(())
    }

    pub fn compare(&mut self, directories: &[PathBuf]) -> Result<ComparatorResult> {
        println!("Comparator comparing ...");
        let mut differences = Vec::new();

        let columns = Columns {
            key: &self.key_cols,
            compare: &self.compare_cols,
            display: &self.display_cols,
        };

        self.lines_left = self.csv_sets[0].get_lines(&columns, &directories[0], &self.ext)?;
        self.lines_right = self.csv_sets[1].get_lines(&columns, &directories[1], &self.ext)?;

        let mut iter_left = self
            .lines_left
            .iter_mut()
            .filter(|line| line.result != Comparison::DuplicatedIndex);
        let mut line_left = iter_left.next().context("Dataset gauche vide")?;

        let mut iter_right = self
            .lines_right
            .iter_mut()
            .filter(|line| line.result != Comparison::DuplicatedIndex);
        let mut line_right = iter_right.next().context("Dataset droit vide")?;

        loop {
            match line_left.key.cmp(&line_right.key) {
                Ordering::Equal => {
                    // Found unique key match (duplicated are skipped) -> compare
                    if check_values_are_identical(&columns, line_left, line_right, &mut differences)
                    {
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
                        }
                        (Some(next_left), None) => {
                            next_left.result = Comparison::InOneOnly;
                            break;
                        }
                        (None, Some(next_right)) => {
                            next_right.result = Comparison::InOneOnly;
                            break;
                        }
                        (None, None) => {
                            break;
                        }
                    }
                }

                Ordering::Less => {
                    // Right is greater -> no match for current left, look at next left with current right
                    line_left.result = Comparison::InOneOnly;
                    match iter_left.next() {
                        Some(next_left) => line_left = next_left,
                        None => break,
                    }
                }

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

        for line in iter_left {
            line.result = Comparison::InOneOnly
        }

        for line in iter_right {
            line.result = Comparison::InOneOnly
        }

        let (in_one_result, in_one_counts) = build_result(
            &self.lines_left,
            &self.lines_right,
            Comparison::InOneOnly,
            &columns,
        );

        let (not_compared_result, not_compared_counts) = build_result(
            &self.lines_left,
            &self.lines_right,
            Comparison::DuplicatedIndex,
            &columns,
        );

        let summary = Summary {
            diffs: differences.len(),
            in_one: in_one_counts,
            not_compared: not_compared_counts,
        };

        let r = ComparatorResult {
            summary,
            in_one: in_one_result,
            not_compared: not_compared_result,
            differences,
            display_cols: self.display_cols.clone(),
        };
        Ok(r)
    }
}

fn check_values_are_identical(
    columns: &Columns,
    left: &mut Line,
    right: &mut Line,
    differences: &mut Vec<Difference>,
) -> bool {
    let mut identical = true;

    for (i, (left_val, right_val)) in left.compare.iter().zip(&right.compare).enumerate() {
        if left_val != right_val {
            let display_hm: HashMap<_, _> = columns
                .display
                .iter()
                .zip(&left.display)
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect();

            differences.push(Difference {
                id: differences.len(),
                _rowkey: left.key.join("-"),
                _col: columns.compare[i].clone(),
                _from: left_val.clone(),
                _to: right_val.clone(),
                display: display_hm,
            });
            identical = false;
        }
    }
    identical
}

fn build_result(
    lines_left: &[Line],
    lines_right: &[Line],
    comparision: Comparison,
    columns: &Columns,
) -> (Vec<HashMap<String, String>>, Vec<usize>) {
    let left = lines_left
        .iter()
        .filter(|l| l.result == comparision)
        .map(|l| (0, l));

    let right = lines_right
        .iter()
        .filter(|l| l.result == comparision)
        .map(|l| (1, l));

    let mut counts = vec![0, 0];

    let result: Vec<_> = left
        .chain(right)
        .enumerate()
        .map(|(i, (set_id, line))| {
            counts[set_id] += 1;
            let mut hm: HashMap<_, _> = columns
                .display
                .iter()
                .zip(&line.display)
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect();

            hm.insert("id".to_string(), i.to_string());
            hm.insert("set".to_string(), set_id.to_string());
            hm
        })
        .collect();

    (result, counts)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_comparison() {
        let dirs = [PathBuf::from("tests/data/a"), PathBuf::from("tests/data/b")];

        let mut comparator = Comparator {
            ext: "tsv".to_string(),
            status: Status::Initial,
            available_cols: vec![],
            key_cols: vec!["Date".to_string(), "Time".to_string(), "Name".to_string()],
            compare_cols: vec!["Col1".to_string(), "Col2".to_string(), "Col3".to_string()],
            display_cols: vec!["Name".to_string(), "Col2".to_string()],
            csv_sets: vec![
                CsvSet {
                    encoding: "utf8".to_string(),
                    comment: "#".to_string(),
                    skip_blank_lines: false,
                    header: 0,
                    separator: "\t".to_string(),
                    strip: false,
                    ignore_whitespace: false,
                },
                CsvSet {
                    encoding: "utf8".to_string(),
                    comment: "#".to_string(),
                    skip_blank_lines: false,
                    header: 0,
                    separator: "\t".to_string(),
                    strip: false,
                    ignore_whitespace: false,
                },
            ],
            lines_left: vec![],
            lines_right: vec![],
        };

        comparator
            .update_status(Status::Initial, Status::Initial, &dirs)
            .unwrap();

        let res = comparator.compare(&dirs).unwrap();

        // Check summary
        assert_eq!(res.summary.diffs, 1); // 1 difference
        assert_eq!(res.summary.in_one, vec![1, 0]); // 1 line in set 0 only
        assert_eq!(res.summary.not_compared, vec![2, 2]); // 2 duplicate keys in sets 0 and 1

        // Check differences
        assert_eq!(res.differences[0]._from, "hello");
        assert_eq!(res.differences[0]._to, "helo");
        assert_eq!(res.differences[0]._rowkey, "01/01/2021-18:20:00-Jane");

        // Check in one
        assert_eq!(res.in_one.len(), 1);
        assert_eq!(res.in_one[0].get("Name").unwrap(), "Bob");

        // Check not compared
        assert_eq!(res.not_compared.len(), 4);
        for i in 0..4 {
            assert_eq!(res.not_compared[i].get("Name").unwrap(), "Duplicate");
        }
    }
}
