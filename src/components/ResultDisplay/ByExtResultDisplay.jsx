import React, {useEffect, useState} from "react";
import {Box, Tabs, Tab} from "@mui/material";
import TopBar from "../TopBar";
import WorkSpace from "../WorkSpace";
import {invoke} from "@tauri-apps/api";
import ResultDataGrid from "./ResultDataGrid";
import {useParams} from "react-router-dom";


function ByExtResultDisplay({comparisonResult, ext, showToast}) {
    console.log("-> Rendering ByExtResultDisplay for", ext);

    const [selectedTabIndex, setselectedTabIndex] = useState(0);
    const [selectionModels, setSelectionModels] = useState([[],[]]);

     let params = useParams();
     
     useEffect(() => {
         switch (params.resultType) {
             case "inOne":
                 setselectedTabIndex(1);
                 break;
             case "notCompared":
                 setselectedTabIndex(2);
                 break;
             default:
                 setselectedTabIndex(0);
         }
     }, [params])

    const handleTabChange = (event, newIndex) => {
        setselectedTabIndex(newIndex);
    };

    const handleUpdateSelectionModel = newSelectionModel => {
        setSelectionModels(prevSelectionModels => {
            const newSelectionModels = [...prevSelectionModels];
            newSelectionModels[selectedTabIndex] = newSelectionModel;
            return newSelectionModels;
        });
    };

    let title, noDiffMessage, rows, columns

    switch (selectedTabIndex) {
        case 0:
            title = "différences détectées dans les colonnes comparées";
            noDiffMessage = "Aucune différence !";

            rows = comparisonResult[ext]?.differences;

            if (rows.length > 0) {
                const columnsDisplay = Object.keys(rows[0])
                    .filter(c => !(c.startsWith("_") || c === "id" ))
                    .map(c => ({field: c, minWidth: 100, flex: 1}));
                columns = [
                    { field: "_rowkey", headerName: "Clé", minWidth: 180, flex: 1},
                    { field: "_col", headerName: "Colonne", minWidth: 150, flex: 1},
                    { field: "_from", headerName: "De", minWidth: 150, flex: 1},
                    { field: "_to", headerName: "A", minWidth: 150, flex: 1},
                ];
                columns.push(...columnsDisplay);
            }
            break;

        case 1:
            title = "données dans un seul set de fichiers";
            noDiffMessage = "Aucune donnée dans un seul set !"

            rows = comparisonResult[ext]?.in_one;

            if (rows.length > 0) {
                const columnsDisplay = Object.keys(rows[0])
                    .filter(c => c !== "id" && c !== "set")
                    .map(c => ({field: c, minWidth: 100, flex: 1}));
                columns = [
                    {field: "set", minWidth: 50, flex: 1},
                ];
                columns.push(...columnsDisplay);
            }
            break;

        case 2:
            title = "données non comparées (plusieurs entrées pour une même clé dans un set)";
            noDiffMessage = "Aucune  clé en double !"

            rows = comparisonResult[ext]?.not_compared;

            if (rows.length > 0) {
                const columnsDisplay = Object.keys(rows[0])
                    .filter(c => c !== "id" && c !== "set")
                    .map(c => ({field: c, minWidth: 100, flex: 1}));
                columns = [
                    {field: "set", minWidth: 50, flex: 1},
                ];
                columns.push(...columnsDisplay);
            }
            break;

    }


    const handleAction = () => {
        const selectionModel = selectionModels[selectedTabIndex];
        const values = selectionModel.map(i => ({...rows[i], id: ""}));

        invoke("handle_result_action", {
            fileExtension: ext,
            values: values,
        })
            .then(info => {
                // display toast only if a non-empty string was returned
                if (info) {
                    showToast(info)
                }
            })
            .catch(e => showToast(e, false))
    }


    return (
        <>
            <TopBar title={ext + ": " + title} btnAction={handleAction} btnText="Visualiser"/>
            <WorkSpace>

                <Box display="flex" justifyContent="center"
                     sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="result tabs">
                        <Tab label="Differences" id="tab1"/>
                        <Tab label="Un seul set" id="tab2"/>
                        <Tab label="Clés en double" id="tab2"/>
                    </Tabs>
                </Box>

                <Box
                    display="flex"
                    justifyContent="center"
                    sx={{height: "calc(100% - 35px)", p: 1}}
                >
                    {rows.length > 0 ?
                        <ResultDataGrid
                            rows={rows}
                            columns={columns}
                            selectionModel={selectionModels[selectedTabIndex]}
                            updateSelectionModel={handleUpdateSelectionModel}
                        />
                        :
                        <p>{noDiffMessage}</p>
                    }

                </Box>

            </WorkSpace>

        </>

    );
}

export default ByExtResultDisplay;
