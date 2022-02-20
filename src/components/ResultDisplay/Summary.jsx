import React from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const sxOk = {
    color: "#2c7039"
}
const sxPb = {
    color: "#bd2025"
}

function Summary({comparisonResult}) {

    return (

        <TableContainer component={Paper} sx={{ maxWidth: 1300}} centered>
            <Table sx={{ minWidth: 650}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell/>
                        <TableCell align="center">Nb lignes différentes</TableCell>
                        <TableCell align="center">Dans set 0 seulement</TableCell>
                        <TableCell align="center">Dans set 1 seulement</TableCell>
                        <TableCell align="center">Clés doublons dans set 0</TableCell>
                        <TableCell align="center">Clés doublons dans set 1</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Object.entries(comparisonResult).map(([extension, comparatorResult]) => {
                            const diffs = comparatorResult.summary.diffs;
                            const inOne0 = comparatorResult.summary.in_one[0];
                            const inOne1 = comparatorResult.summary.in_one[1];
                            const notCompared0 = comparatorResult.summary.not_compared[0];
                            const notCompared1 = comparatorResult.summary.not_compared[1];
                            return (
                                <TableRow
                                    key={extension}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell component="th" scope="row">
                                        {extension}
                                    </TableCell>
                                    <TableCell align="center" sx={diffs > 0 ? sxPb : sxOk}>{diffs}</TableCell>
                                    <TableCell align="center" sx={inOne0 > 0 ? sxPb : sxOk}>{inOne0}</TableCell>
                                    <TableCell align="center" sx={inOne1 > 0 ? sxPb : sxOk}>{inOne1}</TableCell>
                                    <TableCell align="center" sx={notCompared0 > 0 ? sxPb : sxOk}>{notCompared0}</TableCell>
                                    <TableCell align="center" sx={notCompared1 > 0 ? sxPb : sxOk}>{notCompared1}</TableCell>
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
