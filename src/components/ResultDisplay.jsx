import React from "react";
import {invoke} from '@tauri-apps/api/tauri';
import {TreeItem, TreeView} from "@mui/lab";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {Button} from "@mui/material";


function ResultDisplay({comparisonResult, showToast}) {

    console.log("-> Rendering ResultDisplay");

    const handleLeafAction = (ext, index) => {

        const displayColsNames = comparisonResult[ext].display_cols;
        const displayColsValues = comparisonResult[ext].differences.find(line => line.index === index).display_values;

        const args = {
            colNames: displayColsNames,
            colValues: displayColsValues,
            fileExtension: ext
        };

        invoke("on_click_result_leaf", args)
            .then(() => {})
            .catch(e => showToast(e, false))
    }

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
                                                label={<>
                                                    {difference.col + ": '" + difference.left + "' - > '" + difference.right + "'"}
                                                    <Button onClick={() => handleLeafAction(ext, differentLine.index)}>
                                                        GO
                                                    </Button>
                                                </>}
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
