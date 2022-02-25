import {Box} from '@mui/material';
import {drawerWidth, topbarHeight} from "../constants/constants";

function WorkSpace(props) {

    return (
        <Box
            component="main"
            position="absolute"
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
