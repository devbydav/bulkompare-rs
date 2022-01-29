import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


function Summary({comparisonResult}) {

    return (

        <TableContainer component={Paper} sx={{ maxWidth: 800}} centered>
            <Table sx={{ minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell/>
                        <TableCell align="right">Nb lignes différentes</TableCell>
                        <TableCell align="right">Nb lignes seulement dans set 0</TableCell>
                        <TableCell align="right">Nb lignes seulement dans set 1</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Object.entries(comparisonResult).map(([extension, comparatorResult]) => {
                            console.log(extension);
                            return (
                                <TableRow
                                    key={extension}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">
                                        {extension}
                                    </TableCell>
                                    <TableCell align="right">{comparatorResult.summary.diffs}</TableCell>
                                    <TableCell align="right">{comparatorResult.summary.in_one[0]}</TableCell>
                                    <TableCell align="right">{comparatorResult.summary.in_one[1]}</TableCell>
                                </TableRow>
                            )

                        })
                    }
                </TableBody>
            </Table>
        </TableContainer>

    );
}

export default Summary;
