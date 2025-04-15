import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import MenuComponent from './Menu';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const Layout = ({ children, isLoggedIn }) => {

     const theme = createTheme({
        palette: { mode: 'light' },
     });

    return (
       <ThemeProvider theme={theme}>
         <CssBaseline />
          <Box>
           {isLoggedIn && <MenuComponent />}
          <Box component="main" sx={{ p: 3, transition: 'background-color 0.3s ease' }}>{children}</Box>
         </Box>
       </ThemeProvider>
    )
 }

export default Layout;