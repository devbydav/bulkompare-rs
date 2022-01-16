import React from "react";
import {invoke} from '@tauri-apps/api/tauri';
import {TreeItem, TreeView} from "@mui/lab";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";


function InOne({comparisonResult, showToast}) {

    const handleAction = (ext, displayColsValues) => {

        const displayColsNames = comparisonResult[ext].display_cols;

        const args = {
            colNames: displayColsNames,
            colValues: displayColsValues,
            fileExtension: ext
        };

        invoke("on_click_result_leaf", args)
            .then(info => {
                // display toast only if a non-empty string was returned
                if (info) {
                    showToast(info)
                }
            })
            .catch(e => showToast(e, false))
    }

    return (

        <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon/>}
            defaultExpandIcon={<ChevronRightIcon/>}
        >
            {Object.entries(comparisonResult).map(([ext, comparatorResult], b) => (
                    <TreeItem nodeId={ext} key={ext} label={ext}>

                        {comparatorResult.in_one.map((setData, i) => {
                            const id = `${ext}/${i}`;

                            return (
                                <TreeItem
                                    nodeId={id}
                                    key={id}
                                    label={
                                        setData.length > 0 ?
                                            <>
                                                {`Données dans le set ${i} seulement :`}
                                                <TableContainer>
                                                    <Table sx={{ minWidth: 650 }} aria-label="in one table">
                                                        <TableHead>
                                                            <TableRow>
                                                                {comparatorResult.display_cols.map((col, i) => (
                                                                    <TableCell key={i}>{col}</TableCell>
                                                                ))}
                                                                <TableCell>Action</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {setData.map((row, i) => (
                                                                <TableRow
                                                                    key={`${id}/${i}`}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    {row.map(value => (
                                                                        <TableCell key={value}>{value}</TableCell>
                                                                    ))}
                                                                    <TableCell>
                                                                        <Button onClick={() => handleAction(ext, row)}>
                                                                            GO
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </>
                                            :
                                            `RAS dans le set ${i}`

                                    }/>
                            )
                        })}
                    </TreeItem>
                )
            )}

        </TreeView>

    );
}

export default InOne;
