import { DataGrid } from '@mui/x-data-grid';


function ResultDataGrid({rows, columns, selectionModel, updateSelectionModel}) {

    if (!rows) return <p>ERROR</p>
    if (rows.length === 0) return <p>NO DIFF</p>


    return (

        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
            <div style={{ flexGrow: 1 }}>
            <DataGrid
                checkboxSelection
                onSelectionModelChange={updateSelectionModel}
                selectionModel={selectionModel}
                rows={rows}
                columns={columns} />
            </div>
        </div>

    );
}

export default ResultDataGrid;
