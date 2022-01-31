import React from "react";
import { DataGrid } from '@mui/x-data-grid';


function Differences({comparisonResult, ext, showToast}) {
    console.log("Differences for", ext)

    const rows = comparisonResult[ext]?.differences;

    if (!rows) return <p>ERROR</p>
    if (rows.length === 0) return <p>NO DIFF</p>

    const columnsDisplay = Object.keys(rows[0]).filter(c => !(c.startsWith("_") || c === "id" ));

    const columns = [
        { field: "_rowkey", headerName: "Clé", minWidth: 180, flex: 1},
        { field: "_col", headerName: "Colonne", minWidth: 150, flex: 1},
        { field: "_from", headerName: "De", minWidth: 150, flex: 1},
        { field: "_to", headerName: "A", minWidth: 150, flex: 1},
    ];

    columns.push(...columnsDisplay.map(c => ({field: c, minWidth: 100, flex: 1})))


    return (

        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <div style={{ flexGrow: 1 }}>
            <DataGrid checkboxSelection rows={rows} columns={columns} />
            </div>
        </div>

    );
}

export default Differences;
