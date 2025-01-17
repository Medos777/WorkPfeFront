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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Popover,
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
    Add,
    Edit,
    Delete,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {logout} from "../login/Login";
import { format } from 'date-fns';

const Menu = ({ darkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const socket = React.useRef(null);

    useEffect(() => {
        socket.current = io('http://localhost:3001');
        console.log('Connecting to WebSocket...');

        socket.current.on('projectAdded', (notification) => {
            handleNewNotification({
                type: 'add',
                message: `New project "${notification.projectName}" has been created`,
                timestamp: new Date(),
                icon: <Add color="success" />,
                projectId: notification.projectId
            });
        });

        socket.current.on('projectUpdated', (notification) => {
            handleNewNotification({
                type: 'update',
                message: `Project "${notification.projectName}" has been updated`,
                timestamp: new Date(),
                icon: <Edit color="primary" />,
                projectId: notification.projectId
            });
        });

        socket.current.on('projectDeleted', (notification) => {
            handleNewNotification({
                type: 'delete',
                message: `Project "${notification.projectName}" has been deleted`,
                timestamp: new Date(),
                icon: <Delete color="error" />,
                projectId: notification.projectId
            });
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10));
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (event) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchorEl(null);
    };

    const handleNotificationItemClick = (notification) => {
        if (notification.projectId && notification.type !== 'delete') {
            navigate(`/projects/${notification.projectId}`);
        }
        handleNotificationClose();
    };

    const menuItems = [
        { label: 'Home', path: '/', icon: <Home /> },
        { label: 'Projects', path: '/projects', icon: <Dashboard /> },
        { label: 'Teams', path: '/team', icon: <Group /> },
        { label: 'Sprints', path: '/sprints', icon: <Assignment /> },
        { label: 'Issues', path: '/issues', icon: <BugReport /> },
        { label: 'Backlog', path: '/backlog', icon: <BugReport /> },
    ];

    const handleLogout = () => {
        logout();
        socket.current.disconnect();
    };

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

                <Tooltip title="Notifications">
                    <IconButton color="inherit" onClick={handleNotificationClick}>
                        <Badge badgeContent={notifications.length} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>
                </Tooltip>

                <Popover
                    open={Boolean(notificationAnchorEl)}
                    anchorEl={notificationAnchorEl}
                    onClose={handleNotificationClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: { 
                            width: '350px',
                            maxHeight: '400px',
                            overflow: 'auto'
                        }
                    }}
                >
                    <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        Notifications
                    </Typography>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography color="text.secondary">No notifications</Typography>
                        </Box>
                    ) : (
                        <List>
                            {notifications.map((notification, index) => (
                                <ListItem 
                                    key={index}
                                    button
                                    onClick={() => handleNotificationItemClick(notification)}
                                    sx={{
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        {notification.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={notification.message}
                                        secondary={format(notification.timestamp, 'MMM dd, yyyy HH:mm')}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Popover>

                <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                    <IconButton color="inherit" onClick={toggleDarkMode}>
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Tooltip>

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
                    <MenuItem onClick={() => { handleLogout(); window.location.reload(); }}>
                        <Typography variant="body1">Logout</Typography>
                    </MenuItem>
                </MuiMenu>
            </Toolbar>
        </AppBar>
    );
};

export default Menu;