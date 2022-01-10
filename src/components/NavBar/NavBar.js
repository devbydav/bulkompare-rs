import React from 'react';
import {invoke} from '@tauri-apps/api/tauri';
import {open, save} from '@tauri-apps/api/dialog';
import {Route, Switch, useHistory} from 'react-router-dom';
import {Button, Stack} from '@mui/material';

import ComparatorConfigControl from "./ComparatorConfigControl";


const NavBar = ({selection, setSelection, comparator, selectedExt, setSelectedIndex, handleCompare, showToast}) => {
    const history = useHistory();

    const handleSaveSelection = () => {
        console.log("saving sel", selection);

        save({
            defaultPath: "config/default.json",
            filters: [
                    {
                        name: "Fichier sélection",
                        extensions: ["json"],
                    },
                ],
        })
            .then(path => {
                if (path) {
                    return invoke('save_selection', {path, selection: selection})
                        .then(() => showToast("Sélection enregistrée"));
                }
            })
            .catch(e => showToast(e, false))
    };

    const handleOpenSelection = () => {
        console.log("opening sel", selection);

        open({
            defaultPath: "config",
            filters: [
                {
                    name: "Fichier sélection",
                    extensions: ["json"],
                },
            ],
            multiple: false,
            directory: false,
        })
            .then(path => {
                if (path) {
                    return invoke('open_selection', {path})
                        .then((newSelection) => {
                            setSelection(newSelection);
                            showToast("Nouvelle sélection importée")
                        })
                }
            })
            .catch(e => showToast(e, false));
    };

    return (
        <Stack spacing={2} direction="row">
            <Button variant="outlined"
                    onClick={() => history.push('/source')}>
                Fichiers
            </Button>

            {comparator &&
                <ComparatorConfigControl
                    selection={selection}
                    selectedExt={selectedExt}
                    setSelectedIndex={setSelectedIndex}
                    comparator={comparator}
                    handleCompare={handleCompare}
                />}

            <Button variant="outlined" onClick={handleOpenSelection}>
                Ouvrir sélection
            </Button>
            <Button variant="outlined" onClick={handleSaveSelection}>
                Sauver sélection
            </Button>

        </Stack>

    )
};

export default NavBar;
