import React from 'react';
import {Select, MenuItem, ListItemText, Stack} from '@mui/material';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {Status} from "../../constants/constants";


const SuperSelect = ({selection, selectedExt, setSelectedExt, otherComparatorsReady}) => {
    console.log("-> Rendering SuperSelect with", selectedExt);

    const handleChange = (event) => {
        const ext = event.target.value;
        setSelectedExt(ext);
    };

    return (
        <Select
            sx={{ ml: 2, mr: 2 }}
            value={selectedExt}
            renderValue={selected => selected}
            onChange={handleChange}
            error={!otherComparatorsReady}
        >
            {selection.comparators.map(comparator => (
                    <MenuItem key={comparator.ext} value={comparator.ext}>
                        <Stack direction="row" spacing={1}>
                            {comparator.status === Status.Ready ?
                                <CheckCircleIcon fontSize="small" color="success" />
                                :
                                <WarningRoundedIcon fontSize="small" color="warning" />
                            }
                            <ListItemText primary={comparator.ext} />
                        </Stack>
                    </MenuItem>
                )
            )}
        </Select>
    );
};

export default SuperSelect;