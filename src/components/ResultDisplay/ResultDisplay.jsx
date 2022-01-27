import React from "react";

import {Route, Routes} from "react-router-dom";

import SummaryDisplay from "./SummaryDisplay";
import ByExtResultDisplay from "./ByExtResultDisplay";

function ResultDisplay({comparisonResult, showToast}) {

    console.log("-> Rendering ResultDisplay");

    return (
        <>

            <Routes>

                <Route path="summary" element={
                    <SummaryDisplay comparisonResult={comparisonResult}/>
                }/>

                <Route path=":ext/*" element={
                    <ByExtResultDisplay comparisonResult={comparisonResult}/>
                }/>

            </Routes>

        </>

    );
}

export default ResultDisplay;
