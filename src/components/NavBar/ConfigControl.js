import React from 'react';
import {Button, Divider, List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import {Status} from "../../constants/constants";
import Steps from "./Steps";
import SuperSelect from "./SuperSelect";
import {useNavigate} from "react-router-dom";
import {open, save} from "@tauri-apps/api/dialog";
import {invoke} from "@tauri-apps/api/tauri";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";


const ConfigControl = ({selection, setSelection, selectedExt, setSelectedExt, comparator, handleCompare, showToast}) => {
    console.log("-> Rendering ConfigControl with", selectedExt);

    const navigate = useNavigate();

    // check if all comparators are ready
    const allComparatorsReady = selection.comparators.every(c => c.status === Status.Ready);

    // check if all comparators but the selected one are ready
    const otherComparatorsReady = selection.comparators.every(c => (
         (c.status === Status.Ready) || (c.ext === selectedExt))
    );

    if (!comparator) return(<></>);

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
        <>
            <List>
                <ListItem button onClick={handleOpenSelection}>
                    <ListItemIcon>
                        <FolderOpenOutlinedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Ouvrir sélection"/>
                </ListItem>

                <ListItem button onClick={handleSaveSelection}>
                    <ListItemIcon>
                        <SaveOutlinedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Sauver sélection"/>
                </ListItem>
            </List>
            <Divider/>
            <List>
                <ListItem button onClick={() => navigate('/source')}>
                    <ListItemIcon>
                        <Inventory2OutlinedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Choisir sources"/>
                </ListItem>
            </List>
            <SuperSelect
                selection={selection}
                selectedExt={selectedExt}
                setSelectedExt={setSelectedExt}
                otherComparatorsReady={otherComparatorsReady}
            />

            <Steps comparator={comparator}/>

            <Button sx={{m: 2}} variant="outlined" onClick={handleCompare} disabled={!allComparatorsReady}>
                Comparer
            </Button>
        </>

    );
};

export default ConfigControl;