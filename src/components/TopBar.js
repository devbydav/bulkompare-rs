import {
    AppBar,
    Button,
    Toolbar,
    Typography
} from '@mui/material';

const drawerWidth = 240;

function TopBar({title, validate}) {

    return (
        <>
            <AppBar
                position="fixed"
                sx={{width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, textAlign: "left"}}
            >
                <Toolbar>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>

                    {validate &&
                        <Button color="inherit" variant={"outlined"} onClick={validate} >Valider</Button>
                    }

                </Toolbar>
            </AppBar>


        </>
    );
}

export default TopBar;
