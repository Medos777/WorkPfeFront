import React, { useState } from "react";
import { CssBaseline, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Menu from "./Menu";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";

    const theme = createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
        },
    });

    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {!isLoginPage && <Menu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
            <Box component="main" sx={{ p: 3 }}>
                {children}
            </Box>
        </ThemeProvider>
    );
};

export default Layout;
