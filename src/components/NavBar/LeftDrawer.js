import React, {useEffect, useState} from 'react';
import {invoke} from '@tauri-apps/api/tauri';
import {open, save} from '@tauri-apps/api/dialog';
import {useLocation} from 'react-router-dom';
import {
    Button,
    ButtonGroup,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ConfigControl from "./ConfigControl";
import ResultControl from "./ResultControl";
import {drawerWidth} from "../../constants/constants"

const LeftDrawer = ({selection, setSelection, comparator, selectedExt, setSelectedExt, comparisonResult, handleCompare, showToast}) => {

    const [configuring, setConfiguring] = useState(true);

    let location = useLocation();

    useEffect(() => {
        if (location.pathname.startsWith("/result"))
            setConfiguring(false);
    }, [location])

    // Attributes for config/result ButtonGroup
    let configButtonAttributes, resultButtonAttributes;
    if (configuring) {
        configButtonAttributes = {
            variant: "contained"
        };

        if (comparisonResult) {
            resultButtonAttributes = {
                variant: "outlined"
            }
        } else {
            resultButtonAttributes = {
                disabled: true
            }
        }
    } else {
        configButtonAttributes = {
            variant: "outlined"
        };
        resultButtonAttributes = {
            variant: "contained"
        }
    }


    const handleModeChangeToConfiguring = () => {
        if (!configuring) {
            setConfiguring(true);
        }
    };

    const handleModeChangeToResult = () => {
         if (configuring && comparisonResult) {
            setConfiguring(false);
        }
    };

    console.log('location', location);

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
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            {/*<Toolbar />*/}
            <Divider/>
            <ButtonGroup sx={{m: 2}} disableElevation color="primary">
                <Button
                    onClick={handleModeChangeToConfiguring}
                    {...configButtonAttributes}
                >
                    Config
                </Button>
                <Button
                    onClick={handleModeChangeToResult}
                    {...resultButtonAttributes}
                >Résultats
                </Button>

            </ButtonGroup>
            <Divider/>
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
            {configuring ?

                <ConfigControl
                    selection={selection}
                    selectedExt={selectedExt}
                    setSelectedExt={setSelectedExt}
                    comparator={comparator}
                    handleCompare={handleCompare}
                />
                :
                <ResultControl
                    comparisonResult={comparisonResult}
                    setSelectedExt={setSelectedExt}
                />
            }
        </Drawer>
    )
};

export default LeftDrawer;
