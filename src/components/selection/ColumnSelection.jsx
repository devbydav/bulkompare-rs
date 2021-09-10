import React, {useState, useEffect} from "react";
import {useHistory} from 'react-router-dom';
import {Button, Divider, Grid, Stack} from "@mui/material";


function ColumnSelection({comparator, selectedExt, setSelection}) {

    const history = useHistory();
    const [csvCols, setCsvCols] = useState([])

    console.log("-> Rendering ColumnsSelection");

    useEffect(() => {
        console.log("CHANGED COL SELECTION");

        const initialColumns = comparator.available_cols.map(col => ({
                name: col,
                index: comparator.index_cols.includes(col),
                compare: comparator.compare_cols.includes(col),
                display: comparator.display_cols.includes(col)
            })
        );

        setCsvCols(initialColumns);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExt])

    const handleSave = () => {
        const indexCols = csvCols.reduce((filtered, csvCol) => {
            if (csvCol.index) {
                filtered.push(csvCol.name);
            }
            return filtered;
        }, []);

        const compareCols = csvCols.reduce((filtered, csvCol) => {
            if (csvCol.compare) {
                filtered.push(csvCol.name);
            }
            return filtered;
        }, []);

        const displayCols = csvCols.reduce((filtered, csvCol) => {
            if (csvCol.display) {
                filtered.push(csvCol.name);
            }
            return filtered;
        }, []);

        setSelection(prevState => {
            const newConfig = {...prevState};
            const index = newConfig.comparators.findIndex(c => c.ext === selectedExt);
            const newComparator = {...newConfig.comparators[index]};
            newComparator.index_cols = indexCols;
            newComparator.compare_cols = compareCols;
            newComparator.display_cols = displayCols;
            newConfig.comparators[index] = newComparator;
            return newConfig;
        })

        console.log("Saving");
        history.push("/");

    }


    const handleToggleSelection = (colName, selectionType) => {
        setCsvCols(prevState => {
            const newCsvColumns = [...prevState];
            const index = newCsvColumns.findIndex(val => val.name === colName);
            const newCsvColumn = {...newCsvColumns[index]};
            newCsvColumn[selectionType] = !newCsvColumn[selectionType]
            if (selectionType === "index" && newCsvColumn[selectionType]) {
                newCsvColumn["compare"] = false;
            }
            if (selectionType === "compare" && newCsvColumn[selectionType]) {
                newCsvColumn["index"] = false;
            }

            newCsvColumns[index] = newCsvColumn
            return newCsvColumns;
        })

    }

    return (
        <Stack direction="column" spacing={2}>
            <Button onClick={handleSave}>Valider</Button>
            <Grid container spacing={2}>

                {csvCols.map((csvCol, i) => (
                    <React.Fragment key={i}>
                        <Divider style={{width: '100%'}}/>
                        <Grid container item xs={12} spacing={3}>
                            <Grid item xs={4}>
                                <p>{csvCol.name}</p>
                            </Grid>

                            <Grid item xs={2}>
                                <Button
                                    variant={csvCol.index ? "contained" : "outlined"}
                                    color={csvCol.index ? "success" : "secondary"}
                                    onClick={() => handleToggleSelection(csvCol.name, "index")}>
                                    {csvCol.index ? "OUI" : "NON"}
                                </Button>

                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    variant={csvCol.compare ? "contained" : "outlined"}
                                    color={csvCol.compare ? "success" : "secondary"}
                                    onClick={() => handleToggleSelection(csvCol.name, "compare")}>
                                    {csvCol.compare ? "OUI" : "NON"}
                                </Button>
                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    variant={csvCol.display ? "contained" : "outlined"}
                                    color={csvCol.display ? "success" : "secondary"}
                                    onClick={() => handleToggleSelection(csvCol.name, "display")}>
                                    {csvCol.display ? "OUI" : "NON"}
                                </Button>
                            </Grid>
                        </Grid>
                    </React.Fragment>

                ))}

            </Grid>
        </Stack>
    );
}

export default ColumnSelection;
