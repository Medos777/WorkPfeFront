jsx
import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate,  } from 'react-router-dom';

const AnalyticsSubmenu = ({ analyticsMenuAnchor, handleAnalyticsClose, subItems }) => {
    const navigate = useNavigate()

    return (
        <Menu
            anchorEl={analyticsMenuAnchor}
            open={Boolean(analyticsMenuAnchor)}
            onClose={handleAnalyticsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
                sx: {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                    borderRadius: '10px',
                },
            }}
        >
            {subItems.map((subItem) => (
                <MenuItem key={subItem.label} onClick={() => { navigate(subItem.path); handleAnalyticsClose(); }} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
                    <ListItemIcon>{subItem.icon}</ListItemIcon>
                    <ListItemText primary={subItem.label} />
                </MenuItem>
            ))}
        </Menu>
    );
};

export default AnalyticsSubmenu;