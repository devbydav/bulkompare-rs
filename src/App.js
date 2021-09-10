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
import ResultDisplay from "./components/ResultDisplay";
import {defaultSelection} from "./constants/defaults"
import {Alert} from "@mui/lab";


function App() {
    console.log("-> Rendering App")
    const history = useHistory();
    const [comparing, setComparing] = useState(false);
    const [selection, setSelection] = useState(defaultSelection);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [snackbarConfig, setSnackbarConfig] = useState({msg: "", isSuccess: false});

    const selectedExt = selection.comparators[selectedIndex]?.ext ?? "";

    useEffect(() => {
        invoke('open_selection', {
            path: "config/default.json"
        })
            .then((newSelection) => {
                setSelection(newSelection)
            })
            .catch(e => setSnackbarConfig({msg: "Echec ouverture de la sélection par défaut" + e, isSuccess: false}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarConfig({msg: "", isSuccess: false});
    };

    const handleCompare = () => {
        setComparing(true);
        invoke('compare', {selection: selection})
            .then((c) => {
                history.push("/resultDisplay");
                setComparisonResult(c);
                setSnackbarConfig({msg: "Comparaison terminée", isSuccess: true});
                setComparing(false);
            })
            .catch(e => {
                setSnackbarConfig({msg: e, isSuccess: false});
                setComparing(false);
            })
    };


    return (

        <div className="App">
            <Stack>
                <NavBar
                    selection={selection}
                    setSelection={setSelection}
                    selectedExt={selectedExt}
                    setSelectedIndex={setSelectedIndex}
                    handleCompare={handleCompare}
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
                                setSelection={setSelection}
                            />
                        </Route>
                        <Route path="/fileProperties">
                            <FileProperties
                                selection={selection}
                                setSelection={setSelection}
                                fileProperties={selection.comparators[selectedIndex]?.csv_sets}
                                selectedExt={selectedExt}
                            />
                        </Route>
                        <Route path="/columnSelection">
                            <ColumnSelection
                                setSelection={setSelection}
                                comparator={selection.comparators[selectedIndex]}
                                selectedExt={selectedExt}
                            />
                        </Route>
                        <Route path="/resultDisplay">
                            {comparisonResult ?
                                <ResultDisplay comparisonResult={comparisonResult}/>
                                :
                                null}
                        </Route>
                        <Route path="/">
                            <p>HOME</p>
                            <img src={storkLogo} className="Stork-logo" alt="logo"/>
                        </Route>
                    </Switch>
                }
                <Snackbar
                    open={!!snackbarConfig.msg}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbarConfig.isSuccess ? "success" : "error"}
                        sx={{width: '100%'}}
                    >
                        {snackbarConfig.msg}
                    </Alert>
                </Snackbar>
            </Stack>

        </div>
    );
}

export default App;
