import React, {useEffect, useState} from "react";
import {invoke} from '@tauri-apps/api/tauri';
import {useHistory} from 'react-router-dom';
import {Switch, Route} from "react-router-dom";
import {Snackbar, Stack} from '@mui/material';

import storkLogoAnimated from './resources/images/stork_animated.svg';
import storkLogo from './resources/images/stork.svg';
import './App.css';
import NavBar from "./components/NavBar/NavBar";
import SourceSelection from "./components/selection/SourceSelection";
import FileProperties from "./components/selection/FileProperties";
import ColumnSelection from "./components/selection/ColumnSelection";
import ResultDisplay from "./components/ResultDisplay/ResultDisplay";
import {Alert} from "@mui/lab";

import {defaultComparator, defaultSelection} from "./constants/defaults"
import {Status} from "./constants/constants";


function App() {
    console.log("-> Rendering App")
    const history = useHistory();
    const [comparing, setComparing] = useState(false);
    const [selection, setSelection] = useState(defaultSelection);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [snackbarConfig, setSnackbarConfig] = useState(null);

    const selectedComparator = selection.comparators[selectedIndex];
    const selectedExt = selectedComparator?.ext ?? "";

    useEffect(() => {
        invoke('open_selection', {
            path: "config/default.json"
        })
            .then((newSelection) => {
                setSelection(newSelection)
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

        history.push("/");
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

        history.push("/");
    }

     const handleColumnsSelectionSave = (csvCols) => {
        console.log("Saving column selection");

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


         const newSelection = {...selection};
         const newComparator = {
             ...selectedComparator,
             index_cols: indexCols,
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

        history.push("/");

    }

    const handleCompare = () => {
        setComparing(true);
        invoke('compare', {selection: selection})
            .then((c) => {
                history.push("/resultDisplay");
                setComparisonResult(c);
                showToast("Comparaison terminée");
                setComparing(false);
            })
            .catch(e => {
                showToast(e, false);
                setComparing(false);
            })
    };


    return (

        <div className="App">
            <Stack>
                <NavBar
                    selection={selection}
                    setSelection={setSelection}
                    comparator={selectedComparator}
                    selectedExt={selectedExt}
                    setSelectedIndex={setSelectedIndex}
                    handleCompare={handleCompare}
                    showToast={showToast}
                />
                {comparing ?
                    <div>
                        <p>Comparing ...</p>
                        <img src={storkLogoAnimated} className="Stork-logo" alt="logo"/>
                    </div>
                    :
                    <Switch>
                        <Route path="/source">
                            <SourceSelection
                                selection={selection}
                                handleSave={handleSourceSelectionSave}
                            />
                        </Route>
                        <Route path="/fileProperties">
                            <FileProperties
                                fileProperties={selectedComparator?.csv_sets}
                                selectedExt={selectedExt}
                                handleSave={handleFilePropertiesSave}
                            />
                        </Route>
                        <Route path="/columnSelection">
                            <ColumnSelection
                                comparator={selectedComparator}
                                selectedExt={selectedExt}
                                handleSave={handleColumnsSelectionSave}
                            />
                        </Route>
                        <Route path="/resultDisplay">
                            {comparisonResult ?
                                <ResultDisplay comparisonResult={comparisonResult} showToast={showToast}/>
                                :
                                null}
                        </Route>
                        <Route path="/">
                            <p>HOME</p>
                            <img src={storkLogo} className="Stork-logo" alt="logo"/>
                        </Route>
                    </Switch>
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

            </Stack>

        </div>
    );
}

export default App;
