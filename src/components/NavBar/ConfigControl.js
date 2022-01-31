import React from 'react';
import {Button, List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import {Status} from "../../constants/constants";
import Steps from "./Steps";
import SuperSelect from "./SuperSelect";
import {useNavigate} from "react-router-dom";


const ConfigControl = ({selection, selectedExt, setSelectedExt, comparator, handleCompare}) => {
    console.log("-> Rendering ConfigControl with", selectedExt);

    const navigate = useNavigate();

    // check if all comparators are ready
    const allComparatorsReady = selection.comparators.every(c => c.status === Status.Ready);

    // check if all comparators but the selected one are ready
    const otherComparatorsReady = selection.comparators.every(c => (
         (c.status === Status.Ready) || (c.ext === selectedExt))
    );

    if (!comparator) return(<></>);


    return (
        <>
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