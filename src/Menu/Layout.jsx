import React, { useState } from 'react';
import { CssBaseline, Box } from '@mui/material';
import Menu from './Menu';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const Layout = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box>
                <Menu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                <Box component="main" sx={{ p: 3 }}>
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Layout;
