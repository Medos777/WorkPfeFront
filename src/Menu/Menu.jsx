import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProfileMenu from './ProfileMenu';
import AnalyticsSubmenu from './AnalyticsSubmenu';
import { AppBar,
    Toolbar,
    Button,
    IconButton,
    Box,
    Avatar,
    Badge,

    Tooltip,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Popover,
    Divider,
} from '@mui/material'; // Removed unused imports MuiMenu, MenuItem, ExitToApp
import { Home, Dashboard, Group, Add, Edit, Delete, AutoStories, Timeline, BugReportOutlined, BarChart, PeopleAlt, AssessmentOutlined, CloudDownloadOutlined, FlagOutlined, Notifications, ExitToApp} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import logo from '../assets/logo.svg';

const buttonStyles = {
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
};

// Notification Item component for better organization
const NotificationItem = ({ notification, handleNotificationItemClick }) => (
    <div key={notification.index}>
        <ListItem button onClick={() => handleNotificationItemClick(notification)}>
            <ListItemIcon>{notification.icon}</ListItemIcon>
            <ListItemText
                primary={notification.message}
                secondary={format(notification.timestamp, 'MMM d, yyyy HH:mm')}
            />
        </ListItem>
        {notification.index < notification.totalNotifications - 1 && <Divider />}
    </div>
);

const MenuComponent = ({ darkMode, toggleDarkMode }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [analyticsMenuAnchor, setAnalyticsMenuAnchor] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const socket = React.useRef(null); // Socket reference
    const [projectType, setProjectType] = useState(localStorage.getItem('projectType'));
    const [userRole, setUserRole] = useState(localStorage.getItem('role'));

    const handleNewNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 10));
    }, []);

    // Use useCallback to memoize the handleProjectEvent function
    const handleProjectEventCallback = useCallback((event, type, icon) => (notification) => {
        handleNewNotification({
            type,
            message: `Project "${notification.projectName}" has been ${event}`,
            timestamp: new Date(),
            icon,
            projectId: notification.projectId,
        });
    }, [handleNewNotification]);

    useEffect(() => {
        socket.current = io('http://localhost:3001');
        
        const socketCurrent = socket.current; 

        const projectAddedHandler = handleProjectEventCallback('created', 'add', <Add color="success" />);
        const projectUpdatedHandler = handleProjectEventCallback('updated', 'update', <Edit color="primary" />);
        const projectDeletedHandler = handleProjectEventCallback('deleted', 'delete', <Delete color="error" />);

        socketCurrent.on('projectAdded', projectAddedHandler);
        socketCurrent.on('projectUpdated', projectUpdatedHandler);
        socketCurrent.on('projectDeleted', projectDeletedHandler);

        const handleStorageChange = (e) => {
            if (e.key === 'projectType') {
                setProjectType(e.newValue);
            }
            if (e.key === 'role') {
                setUserRole(e.newValue);
            }
        };

        const updateProjectType = () => {
            const currentType = localStorage.getItem('projectType');
            if (currentType !== projectType) {
                setProjectType(currentType);
            }
            const currentRole = localStorage.getItem('role');
            if (currentRole !== userRole) {
                setUserRole(currentRole);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(updateProjectType, 1000);

        return () => {
            socketCurrent.off('projectAdded', projectAddedHandler);
            socketCurrent.off('projectUpdated', projectUpdatedHandler);
            socketCurrent.off('projectDeleted', projectDeletedHandler);

            if (socket.current) socket.current.disconnect();
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [projectType, userRole, handleProjectEventCallback]);

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
                    subItems: [ // Ensure subItems are properly indented
                        { label: 'Project Analytics', path: '/projects/analytics', icon: <AssessmentOutlined /> }, 
                        { label: 'Team Analytics', path: '/teams/analytics', icon: <PeopleAlt /> },
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
                        { label: 'Team Analytics', path: '/teams/analytics', icon: <PeopleAlt /> },
                        { label: 'Reports', path: '/reports', icon: <CloudDownloadOutlined /> },
                    ]
                },
                { label: 'Epics', path: '/epics', icon: <FlagOutlined /> },
            ];
        }
    }, [userRole, projectType]);

    const handleLogout = () => {
        if (socket.current) socket.current.disconnect();
        localStorage.clear();
        window.location.reload(); // consider using navigate('/login') instead of full reload
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
                <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        mr: 4,
                        '&:hover': {
                            opacity: 0.9,
                        }
                    }}
                    onClick={() => navigate('/')}
                >
                    <Box component="img" src={logo} alt="Logo" sx={{ 
                        height: 32,
                        width: 'auto', mr: 1.5
                    }}
                    /> 
                    <Typography
                        variant="h6"
                        sx={{ 
                            color: '#fff', // consider using theme.palette.common.white
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
                          <Box key={item.label}>
                                <Tooltip title={item.label} arrow>
                                    <Button color="inherit" onClick={handleAnalyticsClick} startIcon={item.icon} sx={buttonStyles}>
                                        {item.label}
                                    </Button>
                                </Tooltip>
                                <AnalyticsSubmenu
                                    analyticsMenuAnchor={analyticsMenuAnchor}
                                    handleAnalyticsClose={handleAnalyticsClose}
                                    navigate={navigate}
                                    subItems={item.subItems}
                                />
                            </Box>
                        ) : (
                            <Tooltip title={item.label} arrow>
                                <Button key={item.label} color="inherit" component={RouterLink} to={item.path} startIcon={item.icon} sx={buttonStyles}>
                                    {item.label}
                                </Button>
                            </Tooltip>
                        )
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton color="inherit" onClick={handleNotificationClick} sx={{ position: 'relative' }}>
                        <Badge badgeContent={notifications.length} color="error"> {/* badgeContent={notifications.length > 0 ? notifications.length: null} to hide when zero */}
                            <Notifications />
                        </Badge>
                    </IconButton>

                       <Popover
                        open={Boolean(notificationAnchorEl)}
                        anchorEl={notificationAnchorEl}
                        onClose={handleNotificationClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{
                            sx: {
                                width: 350,
                                maxHeight: 400,
                                overflow: 'auto',
                                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                borderRadius: '10px',
                            },
                        }}
                    >
                        <List>
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <NotificationItem
                                        key={index}
                                        notification={{ ...notification, index, totalNotifications: notifications.length }}
                                        handleNotificationItemClick={handleNotificationItemClick}
                                    />
                                )) 
                            ) : (
                                <ListItem><ListItemText primary="No new notifications" /></ListItem>
                            )}
                        </List>
                    </Popover>


                    <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}> {/* Add aria-label */}
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>U</Avatar> {/* Consider adding dynamic user initial */}
                    </IconButton>
                    <ProfileMenu anchorEl={anchorEl} handleMenuClose={handleMenuClose} handleLogout={handleLogout} />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default MenuComponent;
