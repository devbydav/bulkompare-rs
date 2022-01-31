import React from 'react';
import {Divider, List, ListItem, ListItemIcon, ListItemText} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {useNavigate, useLocation} from 'react-router-dom';


const ResultControl = ({comparisonResult, setSelectedExt}) => {
    const navigate = useNavigate();
    let location = useLocation();

    const handleExtensionClick = ext => {
        setSelectedExt(ext)
        if (!location.pathname.startsWith("/results/details")) {
            navigate("/results/details")
        }
    }

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
                {Object.keys(comparisonResult).map((ext, i) => (
                    <ListItem key={i} button onClick={() => handleExtensionClick(ext)}>
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