use std::fs::{self, ReadDir};
use std::path::{Path, PathBuf};

use anyhow::{ensure, Result};

pub struct Files<'a> {
    read_dir: ReadDir,
    ext: &'a str,
}

impl<'a> Iterator for Files<'a> {
    type Item = PathBuf;

    fn next(&mut self) -> Option<Self::Item> {
        for e in self.read_dir.by_ref() {
            match e {
                Ok(e) => {
                    let p = e.path();
                    if p.is_file() {
                        match p.extension().and_then(|f| f.to_str()) {
                            Some(ext) if ext == self.ext => {
                                return Some(p);
                            }
                            _ => {}
                        }
                    }
                }
                Err(e) => println!("{}", e),
            }
        }
        None
    }
}

impl<'a> Files<'a> {
    pub fn new(directory: &Path, ext: &'a str) -> Result<Files<'a>> {
        ensure!(
            directory.is_dir(),
            "{} is not a directory",
            directory.display()
        );

        Ok(Files {
            read_dir: fs::read_dir(directory)?,
            ext,
        })
    }
}
