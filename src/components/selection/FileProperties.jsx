import React, {useState, useEffect} from "react";

import {Button, Stack, TextField, Switch, FormControlLabel} from '@mui/material';

import {defaultCsvSet} from "../../constants/defaults";


function FileProperties({fileProperties, selectedExt, handleSave}) {
    const [csvSetA, setCsvSetA] = useState(defaultCsvSet)
    const [csvSetB, setCsvSetB] = useState(defaultCsvSet)
    const csvSets = [csvSetA, csvSetB];
    const setCsvSets = [setCsvSetA, setCsvSetB];

    console.log("-> Rendering FileProperties", fileProperties);

    useEffect(() => {
        console.log("CHANGED EXT")
        fileProperties.forEach((csvSet, i) => {
            const separator = csvSet.separator === "\t" ? "" : csvSet.separator;
            setCsvSets[i]({...csvSet, separator: separator});
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedExt])

    const handleEncodingChange = (i, newVal) => {
        updateState(i, "encoding", newVal);
    }

    const handleHeaderChange = (i, newVal) => {
        updateState(i, "header", parseInt(newVal) || 0);
    }

    const handleSeparatorChange = (i, newVal) => {
        updateState(i, "separator", newVal);
    }

    const handleCommentChange = (i, newVal) => {
        const newComment = newVal.length > 1 ? newVal[0] : newVal

        updateState(i, "comment", newComment);
    }

    const updateState = (i, field, newValue) => {
        setCsvSets[i](prevState => ({
            ...prevState,
            [field]: newValue
        }));
    }


    const handleIgnoreWhitespaceChange = (i) => {
        setCsvSets[i](prevState => ({
            ...prevState,
            ignore_whitespace: !prevState.ignore_whitespace
        }));
    }
    return (
        <Stack>
            <Button onClick={() => handleSave(csvSets)}>Valider</Button>
            <Stack direction="row" justifyContent="space-around">
                {fileProperties.map((fp, i) => (
                    <Stack direction="column" spacing={2} key={i}>
                        <TextField
                            id={"Encoding" + i}
                            label="Encodage"
                            variant="outlined"
                            value={csvSets[i].encoding}
                            onChange={e => handleEncodingChange(i, e.target.value)}
                        />

                        <TextField
                            id={"Comment" + i}
                            label="Commentaire"
                            variant="outlined"
                            value={csvSets[i].comment}
                            onChange={e => handleCommentChange(i, e.target.value)}
                        />

                        <TextField
                            id={"Header" + i}
                            label="En-tête"
                            variant="outlined"
                            value={csvSets[i].header}
                            onChange={e => handleHeaderChange(i, e.target.value)}
                        />

                        <TextField
                            id={"Separator" + i}
                            label="Separateur"
                            variant="outlined"
                            value={csvSets[i].separator}
                            onChange={e => handleSeparatorChange(i, e.target.value)}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={csvSets[i].ignore_whitespace}
                                    onChange={() => handleIgnoreWhitespaceChange(i)}/>
                            }
                            label="Ignorer whitespace avant/après"/>

                    </Stack>
                ))}
            </Stack>
        </Stack>
    );

}

export default FileProperties;
