import React from "react";
import {Box, Tabs, Tab, Typography} from "@mui/material";
import Differences from "./Differences";
import InOne from "./InOne";
import Summary from "./Summary";
import TopBar from "../TopBar";
import WorkSpace from "../WorkSpace";


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
            <TopBar title="Résultats"/>
            <WorkSpace>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="result tabs" centered>
                        <Tab label="Résumé" id="tab0"/>
                        <Tab label="Differences" id="tab1"/>
                        <Tab label="Un seul set" id="tab2"/>
                    </Tabs>
                </Box>

                <Box
                    display="flex"
                    justifyContent="center"
                >
                    <TabPanel value={selectedTabIndex} index={0}>
                        <Summary comparisonResult={comparisonResult}/>
                    </TabPanel>

                    <TabPanel value={selectedTabIndex} index={1}>
                        <Differences
                            comparisonResult={comparisonResult}
                            showToast={showToast}
                        />
                    </TabPanel>

                    <TabPanel value={selectedTabIndex} index={2}>
                        <InOne
                            comparisonResult={comparisonResult}
                            showToast={showToast}
                        />
                    </TabPanel>

                </Box>
            </WorkSpace>

        </>

    );
}

export default ResultDisplay;
