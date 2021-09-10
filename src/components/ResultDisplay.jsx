import React from "react";

import {TreeItem, TreeView} from "@mui/lab";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


function ResultDisplay({comparisonResult}) {

    console.log("-> Rendering ResultDisplay");

    return (

        <TreeView
            aria-label="file system navigator"
            defaultCollapseIcon={<ExpandMoreIcon/>}
            defaultExpandIcon={<ChevronRightIcon/>}
        >
            {Object.entries(comparisonResult).map(([ext, comparatorResult], b) => (
                    <TreeItem nodeId={ext} key={ext} label={ext}>

                        {comparatorResult.differences.map(differentLine => {
                            const id = `${ext}/${differentLine.index}`;
                            return (
                                <TreeItem
                                    nodeId={id}
                                    key={id}
                                    label={differentLine.index}>

                                    {differentLine.differences.map(difference => {
                                        const leafId = `${id}/${difference.col}`;
                                        return (
                                            <TreeItem
                                                nodeId={leafId}
                                                key={leafId}
                                                label={difference.col + ": '" + difference.left + "' - > '" + difference.right + "'"}
                                            />
                                        )
                                    })}
                                </TreeItem>
                            )
                        })}
                    </TreeItem>
                )
            )}

        </TreeView>

    );
}

export default ResultDisplay;
