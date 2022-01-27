import React from "react";
import {Box, Tabs, Tab} from "@mui/material";
import Differences from "./Differences";
import InOne from "./InOne";
import TopBar from "../TopBar";
import WorkSpace from "../WorkSpace";

import {useParams} from 'react-router-dom';

function ByExtResultDisplay({comparisonResult, showToast}) {

    const {ext} = useParams();
    console.log("-> Rendering ByExtResultDisplay for", ext);

    const [selectedTabIndex, setselectedTabIndex] = React.useState(0);

    const handleTabChange = (event, newIndex) => {
        setselectedTabIndex(newIndex);
    };

    const title = (selectedTabIndex === 0 ?
        `différences détectées dans les colonnes comparées` :
        `données dans un seul set de fichiers`);

    return (
        <>
            <TopBar title={ext + ": " + title}/>
            <WorkSpace>

                <Box display="flex" justifyContent="center"
                     sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="result tabs">
                        <Tab label="Differences" id="tab1"/>
                        <Tab label="Un seul set" id="tab2"/>
                    </Tabs>
                </Box>

                <Box
                    display="flex"
                    justifyContent="center"
                    sx={{height: "calc(100% - 35px)", p: 1}}
                >
                    {selectedTabIndex === 0 &&
                        <Differences
                            comparisonResult={comparisonResult}
                            showToast={showToast}
                            ext={ext}
                        />
                    }

                    {selectedTabIndex === 1 &&
                        <InOne
                            comparisonResult={comparisonResult}
                            showToast={showToast}
                        />
                    }
                </Box>

            </WorkSpace>

        </>

    );
}

export default ByExtResultDisplay;
