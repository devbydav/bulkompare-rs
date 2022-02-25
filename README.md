# Bulkompare

Bulkompare compares datasets stored in csv-like files.
A dataset corresponds to all the files with a same extension in a specified directory.

### Compare multiple sets simultaneously
Bulkompare can compare multiple couples of datasets independantly, each with their own settings. 
For example, with directory A and directory B both containing **csv** and **tsv** files, Bulkcompare will compare 
- the data from all **csv** files in directory A to the one from **csv** files in directory B
- the data from all **tsv** files in directory A to the one from **tsv** in directory B

### Compare what you want, the way you want
Lines do not need to be in the same file or in the same order to be compared. You can select:

- which columns identify a line (this key can be a single column or a combination of columns)
- which columns should be compared
- which columns should be displayed in the results

### Comparison results
The results will show, for each extension:

- the differences found
- the lines that could not be compared because their key was found only in one dataset
- the lines that could not be compared because their key was found more than once in a dataset


### Save settings
Configuring all the comparison details (file properties, column selection ...) can take some time when files are complex.
All this configuration can be exported/imported to json files with a couple of clicks.
You can also define a default selection that is loaded automatically.

### Why ?
I developped Bulkompare as a validation tool for a software generating multiple complex csv files.
