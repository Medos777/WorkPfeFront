import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    IconButton,
    Menu as MuiMenu,
    MenuItem,
    Box,
    Avatar,
    Badge,
    Typography,
    Tooltip,
} from '@mui/material';
import {
    Home,
    Dashboard,
    Group,
    Assignment,
    BugReport,
    Notifications,
    Brightness4,
    Brightness7,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { io } from 'socket.io-client'; // Import socket.io-client

const Menu = ({ darkMode, toggleDarkMode }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0); // State for notification badge
    const [notifications, setNotifications] = useState([]); // To store received notifications
    const socket = React.useRef(null); // Socket reference

    useEffect(() => {
        // Initialize socket connection
        socket.current = io('http://localhost:3001'); // Replace with your backend URL
        console.log('Connecting to WebSocket...');

        // Listen for notifications
        socket.current.on('receiveNotification', (notification) => {
            console.log('Notification received:', notification);
            setNotifications((prev) => [...prev, notification]);
            setNotificationCount((prevCount) => prevCount + 1);
        });

        // Cleanup on unmount
        return () => {
            socket.current.disconnect();
        };
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const menuItems = [
        { label: 'Home', path: '/', icon: <Home /> },
        { label: 'Projects', path: '/projects', icon: <Dashboard /> },
        { label: 'Teams', path: '/team', icon: <Group /> },
        { label: 'Sprints', path: '/sprints', icon: <Assignment /> },
        { label: 'Issues', path: '/issues', icon: <BugReport /> },
    ];

    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                    {menuItems.map((item) => (
                        <Button
                            key={item.label}
                            color="inherit"
                            component={RouterLink}
                            to={item.path}
                            startIcon={item.icon}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>

                {/* Notification Badge */}
                <Tooltip title="Notifications">
                    <IconButton color="inherit" onClick={() => setNotificationCount(0)}>
                        <Badge badgeContent={notificationCount} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* Dark Mode Toggle */}
                <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                    <IconButton color="inherit" onClick={toggleDarkMode}>
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Tooltip>

                {/* Profile Menu */}
                <Tooltip title="Account Settings">
                    <IconButton onClick={handleMenuOpen}>
                        <Avatar alt="User Avatar" src="/path-to-avatar.jpg" />
                    </IconButton>
                </Tooltip>
                <MuiMenu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        style: {
                            width: '200px',
                        },
                    }}
                >
                    <MenuItem onClick={handleMenuClose}>
                        <Typography variant="body1">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <Typography variant="body1">Settings</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <Typography variant="body1">Logout</Typography>
                    </MenuItem>
                </MuiMenu>
            </Toolbar>
        </AppBar>
    );
};

export default Menu;
