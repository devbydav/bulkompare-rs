import React, {useEffect, useState} from "react";
import {invoke} from '@tauri-apps/api/tauri';
import {useNavigate} from 'react-router-dom';
import {Route, Routes} from "react-router-dom";
import {
    Box,
    CssBaseline,
    Snackbar,
} from '@mui/material';

import storkLogoAnimated from './resources/images/stork_animated.svg';
import storkLogo from './resources/images/stork.svg';
import './App.css';
import SourceSelection from "./components/selection/SourceSelection";
import FileProperties from "./components/selection/FileProperties";
import ColumnSelection from "./components/selection/ColumnSelection";
import LeftDrawer from "./components/NavBar/LeftDrawer";
import StdMain from "./components/StdMain";
import {Alert} from "@mui/lab";

import {defaultComparator, defaultSelection} from "./constants/defaults"
import {Status} from "./constants/constants";
import SummaryDisplay from "./components/ResultDisplay/SummaryDisplay";
import ByExtResultDisplay from "./components/ResultDisplay/ByExtResultDisplay";


function App() {
    console.log("-> Rendering App")
    const navigate = useNavigate()
    const [comparing, setComparing] = useState(false);
    const [selection, setSelection] = useState(defaultSelection);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [selectedExt, setSelectedExt] = useState(null);
    const [snackbarConfig, setSnackbarConfig] = useState(null);

    const selectedIndex = selection.comparators.findIndex(c => c.ext === selectedExt);
    const selectedComparator = selection.comparators[selectedIndex];

    useEffect(() => {

        invoke('open_selection', {
            path: "config/default.json"
        })
            .then((newSelection) => {
                setSelection(newSelection)
                setSelectedExt(newSelection.comparators[0]?.ext)
            })
            .catch(e => showToast("Echec ouverture de la sélection par défaut: " + e, false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const showToast = (msg, isSuccess = true) => {
        setSnackbarConfig({
            msg: msg,
            severity: isSuccess ? "success" : "error",
            duration: isSuccess ? 2000 : 10000
        })
    }

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarConfig({msg: "", isSuccess: false});
    };

    const handleSourceSelectionSave = (extensions, names, dirs) => {
        console.log("Saving source selection")

        // Keep old comparators for extensions that were present before
        const newComparators = extensions.map(ext => (
            selection.comparators.find(c => c.ext === ext) || {...defaultComparator, ext: ext}
        ));


        const newSelection = {
            ...selection,
            names: names,
            dirs: dirs,
            comparators: newComparators
        };

        invoke('update_selection_status', {
            selection: newSelection,
            maxStatusBefore: Status.Initial,
            minStatusAfter: Status.FilesAvailable,
        })
            .then(([updatedSelection, err]) => {
                if (err != null) {
                    showToast(err, false);
                }
                setSelection(updatedSelection)
            })
            .catch(e => showToast("Erreur: " + e, false))

        navigate("/");
    }

    const handleFilePropertiesSave = (newCsvSets) => {
        console.log("Saving file properties");

        const newSelection = {...selection};
        const newComparator = {
            ...selectedComparator,
            csv_sets: newCsvSets,
        };


        invoke('update_comparator_status', {
            comparator: newComparator,
            directories: selection.dirs,
            maxStatusBefore: Status.FilesAvailable,
            minStatusAfter: Status.ColsAvailable,
        })
            .then(([updatedComparator, err]) => {
                if (err != null) {
                    showToast(err, false);
                } else {
                    showToast("Lecture des colonnes disponibles terminée");
                }
                newSelection.comparators[selectedIndex] = updatedComparator;
                setSelection(newSelection)
            })
            .catch(e => showToast("Erreur: " + e, false))

        navigate("/");
    }

     const handleColumnsSelectionSave = (csvCols) => {
        console.log("Saving column selection");

        const keyCols = csvCols.reduce((filtered, csvCol) => {
            if (csvCol.key) {
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


         const newSelection = {...selection};
         const newComparator = {
             ...selectedComparator,
             key_cols: keyCols,
             compare_cols: compareCols,
             display_cols: displayCols,
         };

         invoke('update_comparator_status', {
             comparator: newComparator,
             directories: selection.dirs,
             maxStatusBefore: Status.ColsAvailable,
             minStatusAfter: Status.Ready,
         })
             .then(([updatedComparator, err]) => {
                 if (err != null) {
                     showToast(err, false);
                 } else {
                     showToast("Sélection des colonnes valide");
                 }
                 newSelection.comparators[selectedIndex] = updatedComparator;
                 setSelection(newSelection)
             })
             .catch(e => showToast("Erreur: " + e, false))

        navigate("/");

    }

    const handleCompare = () => {
        setComparing(true);
        invoke('compare', {selection: selection})
            .then(([c, err]) => {
                if (err != null) {
                    showToast(err, false);
                } else {
                    showToast("Comparaison terminée");
                }
                navigate("/results/summary");
                setComparisonResult(c);
                setComparing(false);
            })
            .catch(e => {
                showToast(e, false);
                setComparing(false);
            })
    };


    return (
        <Box className="App" sx={{ display: 'flex' }}>
            <CssBaseline />
            <LeftDrawer
                selection={selection}
                setSelection={setSelection}
                comparator={selectedComparator}
                selectedExt={selectedExt}
                setSelectedExt={setSelectedExt}
                comparisonResult={comparisonResult}
                handleCompare={handleCompare}
                showToast={showToast}
            />

            {comparing ?
                    <StdMain>
                        <p>Comparaison en cours ...</p>
                        <img src={storkLogoAnimated} className="Stork-logo" alt="logo"/>
                    </StdMain>
                :
                <Routes>
                    <Route path="/source" element={
                        <SourceSelection
                            selection={selection}
                            handleSave={handleSourceSelectionSave}
                        />

                    }>
                    </Route>

                    <Route path="/fileProperties" element={
                        <FileProperties
                            fileProperties={selectedComparator?.csv_sets}
                            selectedExt={selectedExt}
                            handleSave={handleFilePropertiesSave}
                        />
                    }>

                    </Route>
                    <Route path="/columnSelection" element={
                        <ColumnSelection
                            comparator={selectedComparator}
                            selectedExt={selectedExt}
                            handleSave={handleColumnsSelectionSave}
                        />
                    }>
                    </Route>

                    {
                        comparisonResult ?
                            <Route path="results" >
                                <Route path="summary" element={
                                    <SummaryDisplay
                                        comparisonResult={comparisonResult}
                                        setSelectedExt={setSelectedExt}
                                        showToast={showToast}
                                    />
                                }/>

                                <Route path=":resultType" element={
                                    <ByExtResultDisplay
                                        comparisonResult={comparisonResult}
                                        ext={selectedExt}
                                        showToast={showToast}
                                    />
                                }/>
                            </Route>
                            :
                            null
                    }



                    <Route path="/" element={
                        <StdMain>
                            <img src={storkLogo} className="Stork-logo" alt="logo"/>
                        </StdMain>
                    }/>

                </Routes>
            }

            {snackbarConfig ?
                <Snackbar
                    open={!!snackbarConfig.msg}
                    autoHideDuration={snackbarConfig.duration}
                    onClose={handleSnackbarClose}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbarConfig.severity}
                        sx={{width: '100%'}}
                    >
                        {snackbarConfig.msg}
                    </Alert>
                </Snackbar>
                :
                null
            }
        </Box>

    );
}

export default App;
