import React from "react";
import {Box, Tabs, Tab, Typography} from "@mui/material";
import Differences from "./Differences";
import InOne from "./InOne";


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}


function ResultDisplay({comparisonResult, showToast}) {

    console.log("-> Rendering ResultDisplay");
    const [selectedTabIndex, setselectedTabIndex] = React.useState(0);

    const handleTabChange = (event, newIndex) => {
        setselectedTabIndex(newIndex);
    };


    return (
        <>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="result tabs" centered>
                    <Tab label="Differences" id="tab0" />
                    <Tab label="Un seul set" id="tab1" />
                </Tabs>
            </Box>

            <TabPanel value={selectedTabIndex} index={0}>
                <Differences
                    comparisonResult={comparisonResult}
                    showToast={showToast}
                />
            </TabPanel>

            <TabPanel value={selectedTabIndex} index={1}>
                <InOne
                    comparisonResult={comparisonResult}
                    showToast={showToast}
                />
            </TabPanel>

        </>

    );
}

export default ResultDisplay;
