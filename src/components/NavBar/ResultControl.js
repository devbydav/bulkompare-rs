import React from 'react';
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {useNavigate} from 'react-router-dom';


const ResultControl = ({comparisonResult}) => {
    const navigate = useNavigate();
    if (!comparisonResult) return <></>
    return (
        <>
            <List>
                <ListItem button onClick={() => navigate('/results/summary')}>
                    <ListItemIcon>
                        <Inventory2OutlinedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Résumé"/>
                </ListItem>
            </List>
            <Divider/>
            <List>
                {Object.keys(comparisonResult).map(ext => (
                    <ListItem button onClick={() => {navigate("/results/" + ext + "/differences")}}>
                        <ListItemIcon>
                            <FolderOpenOutlinedIcon/>
                        </ListItemIcon>
                        <ListItemText primary={ext}/>
                    </ListItem>
                ))}

            </List>
        </>

    );
};

export default ResultControl;