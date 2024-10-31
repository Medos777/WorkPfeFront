import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Menu = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Button color="inherit" component={RouterLink} to="/">
                    Home
                </Button>
                <Button color="inherit" component={RouterLink} to="/project">
                    PROJECT
                </Button>
                <Button color="inherit" component={RouterLink} to="/team">
                    TEAMS
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Menu;