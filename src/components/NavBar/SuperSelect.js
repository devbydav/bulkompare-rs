import React from 'react';

import {Select, MenuItem} from '@mui/material';


const SuperSelect = ({selection, selectedExt, setSelectedIndex}) => {
    console.log("-> Rendering SuperSelect with", selectedExt);

    const handleChange = (event) => {
        const newExt = event.target.value;
        const newIndex = selection.comparators.findIndex(c => c.ext === newExt);
        setSelectedIndex(newIndex);
    };


    return (
        <Select
            labelId="super-select-label"
            id="super-select"
            value={selectedExt}
            label="Ext"
            onChange={handleChange}
        >
            {selection.comparators.map((comparator, i) => (
                    <MenuItem key={i} value={comparator.ext}>{comparator.ext}</MenuItem>
                )
            )}
        </Select>

    );
};

export default SuperSelect;