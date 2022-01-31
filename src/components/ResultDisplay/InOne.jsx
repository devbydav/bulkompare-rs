import { DataGrid } from '@mui/x-data-grid';


function InOne({comparisonResult, ext, showToast}) {
    console.log("InOne for", ext)

    const rows = comparisonResult[ext]?.in_one;

    if (!rows) return <p>ERROR</p>
    if (rows.length === 0) return <p>NO DIFF</p>


    const columnsDisplay = Object.keys(rows[0])
        .filter(c => c !== "id" && c !== "set")
        .map(c => ({field: c, minWidth: 100, flex: 1}));

    const columns = [
        { field: "set",  minWidth: 50, flex: 1},
    ];
    columns.push(...columnsDisplay)


    return (

        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <DataGrid checkboxSelection rows={rows} columns={columns} />
            </div>
        </div>

    );
}

export default InOne;
