import React from 'react';
import {Select, MenuItem, ListItemText, Stack} from '@mui/material';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {Status} from "../../constants/constants";


const SuperSelect = ({selection, selectedExt, setSelectedIndex, otherComparatorsReady}) => {
    console.log("-> Rendering SuperSelect with", selectedExt);

    const handleChange = (event) => {
        const newExt = event.target.value;
        const newIndex = selection.comparators.findIndex(c => c.ext === newExt);
        setSelectedIndex(newIndex);
    };

    return (
        <Select
            sx={{ minWidth: 120 }}
            labelId="super-select-label"
            id="super-select"
            value={selectedExt}
            label="Ext"
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