import React, {useEffect, useState} from "react";
import {invoke} from '@tauri-apps/api/tauri';
import {useHistory} from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
    Stack,
    Button,
    TextField,
    List,
    ListItem,
    IconButton,
    ListItemText,
    Card,
    Container, Divider
} from '@mui/material';

import {defaultComparator} from "../../constants/defaults";
import {Status} from "../../constants/constants";


function SourceSelection({selection, setSelection, showToast}) {
    const history = useHistory();
    const [addExtension, setAddExtension] = useState("")
    const [names, setNames] = useState(["", ""])
    const [dirs, setDirs] = useState(["", ""])
    const [extensions, setExtensions] = useState(["", ""])


    useEffect(() => {
        setNames(selection.names);
        setDirs(selection.dirs);
        setExtensions(selection.comparators.map(c => c.ext))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleNameChange = (i, newVal) => {
        console.log(i, newVal);
        const newNames = [...names];
        newNames[i] = newVal
        setNames(newNames);
    }

    const handleDirChange = (i, newVal) => {
        console.log(i, newVal);
        const newDirs = [...dirs];
        newDirs[i] = newVal
        setDirs(newDirs);
    }


    const handleAddExtension = () => {
        const newExtension = addExtension.trim();
        if (!newExtension) {
            return
        }

        setExtensions(prevExtensions => {
            const newExtensions = [...prevExtensions, newExtension];
            newExtensions.sort((a, b) => {
                const al = a.toLowerCase();
                const bl = b.toLowerCase();
                if (al < bl) {
                    return -1;
                }
                if (al > bl) {
                    return 1;
                }
                return 0;
            });
            return newExtensions;
        });

        setAddExtension("");
    }

    const handleRemoveExtension = (ext) => {
        setExtensions(prevExtensions => prevExtensions.filter(e => e !== ext));
    }

    const handleSave = () => {
        console.log("saving ...")
        const newComparators = extensions.map(ext => (
            selection.comparators.find(c => c.ext === ext) || {...defaultComparator, ext: ext}
        ));

        // Status is back to Initial
        newComparators.forEach(comparator => {comparator.status = Status.Initial});

        const newSelection = {
            ...selection,
            names: names,
            dirs: dirs,
            comparators: newComparators
        };

        invoke('update_selection_status', {
            selection: newSelection,
            minStatus: Status.FilesAvailable,
        })
            .then(updatedSelection => setSelection(updatedSelection))
            .catch(e => {
                setSelection(newSelection);
                showToast(e, false);
            })

        history.push("/");
    }


    return (

        <Stack direction="column" spacing={2} alignItems="center">
            <Button onClick={handleSave}>Valider</Button>


            <Stack direction="row" spacing={5}>
                {names.map((name, i) => (
                    <Stack direction="column" spacing={2} key={i}>
                        <TextField
                            id={"Name" + i}
                            label="Nom"
                            variant="outlined"
                            value={name}
                            onChange={e => handleNameChange(i, e.target.value)}
                        />

                        <TextField
                            id={"Dir" + i}
                            label="Répertoire"
                            variant="outlined"
                            value={dirs[i]}
                            onChange={e => handleDirChange(i, e.target.value)}
                        />


                    </Stack>
                ))}
            </Stack>


            <Divider style={{width: '60%'}}>Extensions</Divider>
            <Stack direction="row" spacing={1}>
                <TextField
                    size="small"
                    id="AddExt"
                    label="Nouvelle extension"
                    variant="standard"
                    value={addExtension}
                    onChange={e => setAddExtension(e.target.value)}
                />
                <IconButton color="primary" onClick={handleAddExtension}>
                    <AddIcon/>
                </IconButton>
            </Stack>


            <Container maxWidth="xs">
                <Card>
                    <List dense={true}>
                        {extensions.map((ext, i) => (
                                <ListItem
                                    key={i}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleRemoveExtension(ext)}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    }
                                >
                                    {/*<ListItemAvatar>*/}
                                    {/*    <Avatar>*/}
                                    {/*        <FolderIcon/>*/}
                                    {/*    </Avatar>*/}
                                    {/*</ListItemAvatar>*/}
                                    <ListItemText
                                        primary={ext}
                                    />
                                </ListItem>
                            )
                        )}
                    </List>
                </Card>
            </Container>

        </Stack>

    );
}

export default SourceSelection;
