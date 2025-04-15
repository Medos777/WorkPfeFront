jsx
import React from 'react';
import { Menu, MenuItem, List, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, ExitToApp } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const ProfileMenu = ({ anchorEl, handleMenuClose, handleLogout }) => {
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
                sx: {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                },
            }}
        >
            <List>
                <MenuItem component={RouterLink} to="/dashboard" sx={{ py: 1.5 }}>
                    <ListItemIcon><Dashboard /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                    <ListItemIcon><ExitToApp /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </MenuItem>
            </List>
        </Menu>
    );
};

export default ProfileMenu;