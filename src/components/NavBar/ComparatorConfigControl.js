import React from 'react';
import {Button} from '@mui/material';

import {Status} from "../../constants/constants";
import Steps from "./Steps";
import SuperSelect from "./SuperSelect";


const ComparatorConfigControl = ({selection, selectedExt, setSelectedIndex, comparator, handleCompare}) => {
    console.log("-> Rendering ComparatorConfigControl with", selectedExt);

    // check if all comparators are ready
    const allComparatorsReady = selection.comparators.every(c => c.status === Status.Ready);

    // check if all comparators but the selected one are ready
    const otherComparatorsReady = selection.comparators.every(c => (
         (c.status === Status.Ready) || (c.ext === selectedExt))
    );


    return (
        <>
            <SuperSelect
                selection={selection}
                selectedExt={selectedExt}
                setSelectedIndex={setSelectedIndex}
                otherComparatorsReady={otherComparatorsReady}
            />

            <Steps comparator={comparator}/>

            <Button variant="outlined" onClick={handleCompare} disabled={!allComparatorsReady}>
                Comparer
            </Button>
        </>

    );
};

export default ComparatorConfigControl;