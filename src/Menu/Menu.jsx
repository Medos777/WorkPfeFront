import React, { useState, useEffect, useMemo } from 'react';
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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Popover,
    Divider,
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
    AutoStories,
    Analytics,
    Assessment,
    CloudDownload,
    Flag,
    BookmarkBorder,
    Speed as SpeedIcon,
    Timeline,
    BugReportOutlined,
    BarChart,
    PeopleAlt,
    AssessmentOutlined,
    CloudDownloadOutlined,
    FlagOutlined,
    ExitToApp,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {logout} from "../login/Login";
import { format } from 'date-fns';
import logo from '../assets/logo.svg';

const Menu = ({ darkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const socket = React.useRef(null);
    const [analyticsMenuAnchor, setAnalyticsMenuAnchor] = useState(null);
    const [projectType, setProjectType] = useState(localStorage.getItem('projectType'));
    const [userRole, setUserRole] = useState(localStorage.getItem('role'));

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

        const handleStorageChange = (e) => {
            if (e.key === 'projectType') {
                setProjectType(e.newValue);
            }
            if (e.key === 'role') {
                setUserRole(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const interval = setInterval(() => {
            const currentType = localStorage.getItem('projectType');
            if (currentType !== projectType) {
                setProjectType(currentType);
            }
        }, 1000);

        return () => {
            socket.current.disconnect();
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [projectType]);

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

    const handleAnalyticsClick = (event) => {
        setAnalyticsMenuAnchor(event.currentTarget);
    };

    const handleAnalyticsClose = () => {
        setAnalyticsMenuAnchor(null);
    };

    const menuItems = useMemo(() => {
        const baseItems = [
            { label: 'Home', path: '/', icon: <Home /> },
            { label: 'Projects', path: '/projects', icon: <Dashboard /> },
        ];

        if (userRole === 'developer') {
            return [
                ...baseItems,
                { label: 'Epics', path: '/epics', icon: <FlagOutlined /> },
                ...(projectType !== 'Kanban' ? [
                    { label: 'Backlog', path: '/backlog', icon: <AutoStories /> },
                    { label: 'Sprints', path: '/sprints', icon: <Timeline /> },
                ] : []),
                { label: 'Issues', path: '/issues', icon: <BugReportOutlined /> },
            ];
        } else if (userRole === 'admin') {
            return [
                ...baseItems,
                { label: 'Teams', path: '/team', icon: <Group /> },
                { label: 'User Management', path: '/user/details', icon: <PeopleAlt /> },
                { 
                    label: 'Analytics', 
                    path: '/analytics', 
                    icon: <BarChart />,
                    subItems: [
                        { label: 'Project Analytics', path: '/projects/analytics', icon: <AssessmentOutlined /> },
                        { label: 'Team Performance', path: '/teams/analytics', icon: <PeopleAlt /> },
                        { label: 'Reports', path: '/reports', icon: <CloudDownloadOutlined /> },
                    ]
                },
            ];
        } else {
            return [
                ...baseItems,
                { label: 'Teams', path: '/team', icon: <Group /> },
                ...(projectType !== 'Kanban' ? [
                    { label: 'Backlog', path: '/backlog', icon: <AutoStories /> },
                    { label: 'Sprints', path: '/sprints', icon: <Timeline /> },
                ] : []),
                { label: 'Issues', path: '/issues', icon: <BugReportOutlined /> },
                { 
                    label: 'Analytics', 
                    path: '/analytics', 
                    icon: <BarChart />,
                    subItems: [
                        { label: 'Project Analytics', path: '/projects/analytics', icon: <AssessmentOutlined /> },
                        { label: 'Team Performance', path: '/teams/analytics', icon: <PeopleAlt /> },
                        { label: 'Reports', path: '/reports', icon: <CloudDownloadOutlined /> },
                    ]
                },
                { label: 'Epics', path: '/epics', icon: <FlagOutlined /> },
            ];
        }
    }, [userRole, projectType]);

    const handleLogout = () => {
        // Déconnecter le socket
        if (socket.current) {
            socket.current.disconnect();
        }
        
        // Nettoyer le localStorage
        localStorage.clear(); // Nettoie tout le localStorage
        // ou spécifiquement :
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('projectType');
        localStorage.removeItem('isLoggedIn'); // Important pour le contrôle d'affichage du menu
        
        // Rediriger vers la page de connexion
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        mr: 4,
                        '&:hover': {
                            opacity: 0.9
                        }
                    }}
                    onClick={() => navigate('/')}
                >
                    <Box 
                        component="img"
                        src={logo}
                        alt="Logo"
                        sx={{ 
                            height: 32,
                            width: 'auto',
                            mr: 1.5
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{ 
                            color: '#fff',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            fontSize: '1.25rem',
                            userSelect: 'none',
                            lineHeight: 1
                        }}
                    >
                        TaskFlow
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                    {menuItems.map((item) => (
                        item.subItems ? (
                            <React.Fragment key={item.label}>
                                <Button
                                    color="inherit"
                                    onClick={handleAnalyticsClick}
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
                                <MuiMenu
                                    anchorEl={analyticsMenuAnchor}
                                    open={Boolean(analyticsMenuAnchor)}
                                    onClose={handleAnalyticsClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    {item.subItems.map((subItem) => (
                                        <MenuItem
                                            key={subItem.label}
                                            onClick={() => {
                                                navigate(subItem.path);
                                                handleAnalyticsClose();
                                            }}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            {subItem.icon}
                                            {subItem.label}
                                        </MenuItem>
                                    ))}
                                </MuiMenu>
                            </React.Fragment>
                        ) : (
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
                        )
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        color="inherit"
                        onClick={handleNotificationClick}
                        sx={{ position: 'relative' }}
                    >
                        <Badge badgeContent={notifications.length} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>

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
                    >
                        <List sx={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            button
                                            onClick={() => handleNotificationItemClick(notification)}
                                        >
                                            <ListItemIcon>{notification.icon}</ListItemIcon>
                                            <ListItemText
                                                primary={notification.message}
                                                secondary={format(notification.timestamp, 'MMM d, yyyy HH:mm')}
                                            />
                                        </ListItem>
                                        {index < notifications.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="No new notifications" />
                                </ListItem>
                            )}
                        </List>
                    </Popover>

                    <IconButton color="inherit" onClick={toggleDarkMode}>
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    <IconButton
                        onClick={handleMenuOpen}
                        size="small"
                        sx={{ ml: 2 }}
                    >
                        <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
                    </IconButton>

                    <MuiMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                    >
                        <List>
                            <ListItem button component={RouterLink} to="/dashboard">
                                <ListItemIcon>
                                    <Dashboard />
                                </ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>

                            <ListItem button onClick={handleLogout}>
                                <ListItemIcon>
                                    <ExitToApp />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItem>
                        </List>
                    </MuiMenu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Menu;