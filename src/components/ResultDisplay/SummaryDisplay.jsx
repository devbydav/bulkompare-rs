import React from "react";

import {Box} from "@mui/material";

import Summary from "./Summary";
import TopBar from "../TopBar";
import WorkSpace from "../WorkSpace";


function SummaryDisplay({comparisonResult, setSelectedExt, showToast}) {

    console.log("-> Rendering SummaryDisplay");

    return (
        <>
            <TopBar title="Résultats"/>

            <WorkSpace>
                <Box
                    display="flex"
                    justifyContent="center"
                    sx={{p: 1}}
                >
                    <Summary comparisonResult={comparisonResult} setSelectedExt={setSelectedExt}/>
                </Box>
            </WorkSpace>

        </>

    );
}

export default SummaryDisplay;
