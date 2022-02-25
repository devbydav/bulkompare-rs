import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter as Router,} from "react-router-dom";
import {createTheme, ThemeProvider} from "@mui/material";
import {green} from "@mui/material/colors";

const theme = createTheme({
    palette: {
        primary: {
            main: green[800],
        },
    },
});

ReactDOM.render(
    // <React.StrictMode>
    <Router>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </Router>,
    // </React.StrictMode>,
    document.getElementById('root')
);
