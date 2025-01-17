import React, { useState, useEffect } from 'react';
import { CssBaseline, Box } from '@mui/material';
import Menu from './Menu';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const Layout = ({ children, isLoggedIn }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === null) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
        } else {
            setDarkMode(savedMode === 'true');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode);
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box>
                {isLoggedIn && <Menu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
                <Box component="main" sx={{ p: 3, transition: 'background-color 0.3s ease' }}>
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Layout;