import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {
    Button,
    ButtonGroup,
    Divider,
    Drawer,
} from '@mui/material';

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

            {configuring ?
                <ConfigControl
                    selection={selection}
                    setSelection={setSelection}
                    selectedExt={selectedExt}
                    setSelectedExt={setSelectedExt}
                    comparator={comparator}
                    handleCompare={handleCompare}
                    showToast={showToast}
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
