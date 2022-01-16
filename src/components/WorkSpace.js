import {
    Box,
    Toolbar,
} from '@mui/material';

function WorkSpace(props) {

    return (
        <Box
            component="main"
            sx={{flexGrow: 1, bgcolor: 'background.default', p: 3}}
        >
            <Toolbar/>
            {props.children}
        </Box>

    );
}

export default WorkSpace;
