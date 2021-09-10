import React from 'react';
import {invoke} from '@tauri-apps/api/tauri';
import {Route, Switch, useHistory} from 'react-router-dom';
import {Button, Stack} from '@mui/material';

import SuperSelect from "./SuperSelect";
import Steps from "./Steps";


const NavBar = ({selection, setSelection, selectedExt, setSelectedIndex, handleCompare}) => {
    const history = useHistory();

    const handleSaveSelection = () => {
        console.log("saving sel", selection);
        invoke('save_selection', {
                path: "config/default.json",
                selection: selection
            }
        )
            .then(() => console.log("Sélection enregistrée"))
            .catch(e => console.log(e))
    };

    const handleOpenSelection = () => {
        console.log("opening sel", selection);
        invoke('open_selection', {
                path: "config/default.json"
            }
        )
            .then((newSelection) => {
                setSelection(newSelection);
                console.log("Nouvelle sélection importée")
            })
            .catch(e => console.log("Echec de la lecture de sélection", e))
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
