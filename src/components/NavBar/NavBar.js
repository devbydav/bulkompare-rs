import React from 'react';
import {invoke} from '@tauri-apps/api/tauri';
import {Route, Switch, useHistory} from 'react-router-dom';
import {Button, Stack} from '@mui/material';

import SuperSelect from "./SuperSelect";
import Steps from "./Steps";


const NavBar = ({selection, setSelection, selectedExt, setSelectedIndex, handleCompare, showToast}) => {
    const history = useHistory();

    const handleSaveSelection = () => {
        console.log("saving sel", selection);
        invoke('save_selection', {
                path: "config/default.json",
                selection: selection
            }
        )
            .then(() => showToast("Sélection enregistrée"))
            .catch(e => showToast(e, false))
    };

    const handleOpenSelection = () => {
        console.log("opening sel", selection);
        invoke('open_selection', {
                path: "config/default.json"
            }
        )
            .then((newSelection) => {
                setSelection(newSelection);
                showToast("Nouvelle sélection importée")
            })
            .catch(e => showToast(e, false))
    };

    return (
        <Stack spacing={2} direction="row">
            <Button variant="outlined"
                    onClick={() => history.push('/source')}>
                Fichiers
            </Button>

            <Switch>
                <Route path="/source">
                </Route>
                <Route>
                    <SuperSelect
                        selection={selection}
                        selectedExt={selectedExt}
                        setSelectedIndex={setSelectedIndex}/>

                    <Steps history={history}/>
                    <Button variant="outlined" onClick={handleCompare}>
                        Comparer
                    </Button>
                    <Button variant="outlined" onClick={handleOpenSelection}>
                        Ouvrir sélection
                    </Button>
                    <Button variant="outlined" onClick={handleSaveSelection}>
                        Sauver sélection
                    </Button>

                </Route>
            </Switch>

        </Stack>

    )
};

export default NavBar;
