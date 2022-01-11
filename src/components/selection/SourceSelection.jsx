import React, {useEffect, useState} from "react";

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {
    Stack,
    Button,
    TextField,
    List,
    ListItem,
    IconButton,
    ListItemText,
    Card,
    Container,
    Divider,
    InputAdornment,
    OutlinedInput,
    InputLabel,
    FormControl
} from '@mui/material';
import {open} from "@tauri-apps/api/dialog";


function SourceSelection({selection, handleSave}) {
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

    const handleDirOpen = (i) => {
        open({
            multiple: false,
            directory: true,
        })
            .then(path => {
                if (path) {
                    handleDirChange(i, path);
                }
            })
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


    return (

        <Stack direction="column" spacing={2} alignItems="center">
            <Button onClick={() => handleSave(extensions, names, dirs)}>Valider</Button>


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

                        <FormControl sx={{ m: 1, width: '50ch' }} variant="outlined">
                            <InputLabel htmlFor={"Dir" + i}>Répertoire</InputLabel>
                            <OutlinedInput
                                id={"Dir" + i}
                                type="text"
                                value={dirs[i]}
                                onChange={e => handleDirChange(i, e.target.value)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => handleDirOpen(i)}
                                            onMouseDown={e=>e.preventDefault()}
                                            edge="end"
                                        >
                                            <FolderOpenIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Répertoire"
                            />
                        </FormControl>

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
