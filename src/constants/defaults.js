import {Status} from "./constants"

export const defaultCsvSet = {
    "encoding": "utf8",
    "comment": "#",
    "skip_blank_lines": false,
    "header": 0,
    "separator": "\t",
    "strip": true,
    "mapping": {},
    "ignore_whitespace": true
}

export const defaultComparator = {
    "status": Status.Initial,
    "available_cols": [],
    "key_cols": [],
    "compare_cols": [],
    "display_cols": [],
    "csv_sets": [defaultCsvSet, defaultCsvSet]
}

export const defaultSelection = {
    "selected": -1,
    "names": ["Set A", "Set B"],
    "dirs": ["", ""],
    "comparators": []
}
