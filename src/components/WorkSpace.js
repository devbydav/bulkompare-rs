import {Box} from '@mui/material';

const drawerWidth = 240;
const topbarHeight = 60;

function WorkSpace(props) {

    return (
        <Box
            component="main"
            position="fixed"
            sx={{width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                height: `calc(100% - ${topbarHeight}px)`,
                mt: `${topbarHeight}px`,
                p: 3}}
        >
            {props.children}
        </Box>

    );
}

export default WorkSpace;
