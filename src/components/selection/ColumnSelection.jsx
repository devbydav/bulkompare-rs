import React, {useState, useEffect} from "react";

import {
    Button,
    ButtonGroup,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import TopBar from "../TopBar";
import WorkSpace from "../WorkSpace";

function ColumnSelection({comparator, selectedExt, handleSave}) {

    const [csvCols, setCsvCols] = useState([])

    console.log("-> Rendering ColumnsSelection");

    useEffect(() => {
        console.log("CHANGED COL SELECTION");

        const initialColumns = comparator.available_cols.map(col => ({
                name: col,
                key: comparator.key_cols.includes(col),
                compare: comparator.compare_cols.includes(col),
                display: comparator.display_cols.includes(col)
            })
        );

        setCsvCols(initialColumns);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExt])

    const handleToggleSelection = (colName, selectionType) => {
        setCsvCols(prevState => {
            const newCsvColumns = [...prevState];
            const index = newCsvColumns.findIndex(val => val.name === colName);
            const newCsvColumn = {...newCsvColumns[index]};
            newCsvColumn[selectionType] = !newCsvColumn[selectionType]
            if (selectionType === "key" && newCsvColumn[selectionType]) {
                newCsvColumn["compare"] = false;
            }
            if (selectionType === "compare" && newCsvColumn[selectionType]) {
                newCsvColumn["key"] = false;
            }

            newCsvColumns[index] = newCsvColumn
            return newCsvColumns;
        })

    }

    const clearColSelection = colName => {
        setCsvCols(prevState => {
            const newCsvColumns = [...prevState];
            const index = newCsvColumns.findIndex(val => val.name === colName);
            newCsvColumns[index] = {name: colName, key: false, compare: false, display: false};
            return newCsvColumns;
        })

    }

    const selected = {
        // color: "primary",
        variant: "contained"
    }
    const notSelected = {
        // color: "secondary",
        variant: "outlined"
    }

    return (
        <>
            <TopBar title="Sélection des colonnes" btnAction={() => handleSave(csvCols)}/>
            <WorkSpace>
                <TableContainer sx={{minWidth: 650, maxWidth: 900}}>
                    <Table size="small" aria-label="simple table">
                        <TableBody>
                            {csvCols.map((csvCol, i) => (
                                <TableRow
                                    key={i}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">
                                        {csvCol.name}
                                    </TableCell>
                                    <TableCell align="center">
                                        <ButtonGroup disableElevation color="primary">
                                            <Button
                                                onClick={() => handleToggleSelection(csvCol.name, "key")}
                                                {...(csvCol.key ? selected : notSelected)}
                                            >
                                                Clé
                                            </Button>
                                            <Button
                                                onClick={() => handleToggleSelection(csvCol.name, "compare")}
                                                {...(csvCol.compare ? selected : notSelected)}
                                            >Comparer
                                            </Button>
                                            <Button
                                                onClick={() => handleToggleSelection(csvCol.name, "display")}
                                                {...(csvCol.display ? selected : notSelected)}
                                            >
                                                Afficher
                                            </Button>
                                        </ButtonGroup>
                                        <IconButton
                                            onClick={() => clearColSelection(csvCol.name)}
                                            aria-label="clear"
                                            size="small"
                                        >
                                            <ClearIcon fontSize="inherit"/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </WorkSpace>
        </>
    );
}

export default ColumnSelection;
