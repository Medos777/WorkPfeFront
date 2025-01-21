import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    AppBar,
    Toolbar,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Breadcrumbs,
    Link,
    IconButton
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BugReportIcon from '@mui/icons-material/BugReport';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MenuIcon from '@mui/icons-material/Menu';
import ProjectService from '../service/ProjectService';
import SprintService from '../service/SprintService';
import EpicService from '../service/EpicService';
import BacklogService from '../service/BacklogService';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [sprints, setSprints] = useState([]);
    const [epics, setEpics] = useState([]);
    const [backlogs, setBacklogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [projectType, setProjectType] = useState(localStorage.getItem('projectType'));

    const handleItemClick = (item, type) => {
        setSelectedItem(item);
        setSelectedType(type);
        setShowTable(false);
    };

    const handleSectionClick = (type) => {
        setSelectedType(type);
        setSelectedItem(null);
        setShowTable(true);
    };

    const renderTable = () => {
        let data = [];
        let columns = [];

        switch (selectedType) {
            case 'epic':
                data = epics;
                columns = [
                    { field: 'name', headerName: 'Name', flex: 1 },
                    { field: 'status', headerName: 'Status', width: 120 },
                    { field: 'description', headerName: 'Description', flex: 1.5 }
                ];
                break;
            case 'backlog':
                data = backlogs;
                columns = [
                    { field: 'name', headerName: 'Name', flex: 1 },
                    { field: 'status', headerName: 'Status', width: 120 },
                    { 
                        field: 'items', 
                        headerName: 'Items', 
                        width: 100,
                        renderCell: (params) => params.value ? params.value.length : 0
                    }
                ];
                break;
            case 'sprint':
                data = sprints;
                columns = [
                    { field: 'name', headerName: 'Name', flex: 1 },
                    { field: 'status', headerName: 'Status', width: 120 },
                    { 
                        field: 'startDate', 
                        headerName: 'Start Date', 
                        width: 120,
                        renderCell: (params) => new Date(params.value).toLocaleDateString()
                    },
                    { 
                        field: 'endDate', 
                        headerName: 'End Date', 
                        width: 120,
                        renderCell: (params) => new Date(params.value).toLocaleDateString()
                    }
                ];
                break;
            default:
                return null;
        }

        return (
            <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.field}
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: '#f5f5f5',
                                        color: '#546e7a'
                                    }}
                                    width={column.width}
                                >
                                    {column.headerName}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow
                                key={row._id}
                                hover
                                onClick={() => handleItemClick(row, selectedType)}
                                sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#f5f5f5' }
                                }}
                            >
                                {columns.map((column) => (
                                    <TableCell key={column.field}>
                                        {column.renderCell ? 
                                            column.renderCell({ value: row[column.field] }) : 
                                            row[column.field] || '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        );
    };

    const renderMainContent = () => {
        if (!selectedItem) {
            return (
                <>
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h5">{project.projectName}</Typography>
                        <Box 
                            sx={{ 
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}
                        >
                            Planned
                        </Box>
                    </Box>

                    <Box sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Description</Typography>
                        <Typography variant="body1" paragraph>
                            {project.description || 'No description available'}
                        </Typography>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Project Details</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body1">
                                <strong>Project Type:</strong> {project.projectType}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body1">
                                <strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                </>
            );
        }

        return (
            <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
                <Box sx={{ 
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    mb: 3
                }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ 
                            color: '#1976d2',
                            fontWeight: 500 
                        }}>
                            {selectedType === 'epic' ? 'Epic Details' : selectedType === 'backlog' ? 'Backlog Details' : 'Sprint Details'}
                        </Typography>
                        <Box 
                            sx={{ 
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}
                        >
                            {selectedItem.status || 'to do'}
                        </Box>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                            color: '#546e7a',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}>
                            Name
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#263238' }}>
                            {selectedItem.name}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ 
                            color: '#546e7a',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}>
                            Description
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#263238' }}>
                            {selectedItem.description || 'No description available'}
                        </Typography>
                    </Box>

                    {selectedType === 'sprint' && (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ 
                                color: '#546e7a',
                                fontWeight: 500,
                                fontSize: '0.875rem'
                            }}>
                                Sprint Details
                            </Typography>
                            <Box sx={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 3,
                                mt: 2
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#546e7a' }}>
                                        Start Date
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#263238', fontWeight: 500 }}>
                                        {new Date(selectedItem.startDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#546e7a' }}>
                                        End Date
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#263238', fontWeight: 500 }}>
                                        {new Date(selectedItem.endDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                            {selectedItem.goal && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="caption" sx={{ color: '#546e7a' }}>
                                        Goal
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#263238', mt: 0.5 }}>
                                        {selectedItem.goal}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

    const renderBreadcrumbs = () => {
        const paths = [
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/projects' },
            { name: project?.projectName || 'Project Details', path: `/projects/${id}` }
        ];

        if (selectedType && !showTable) {
            paths.push({ 
                name: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s`, 
                path: '#',
                onClick: () => handleSectionClick(selectedType)
            });
        }

        if (selectedItem) {
            paths.push({ 
                name: selectedItem.name, 
                path: '#' 
            });
        }

        return paths;
    };

    const topNavBar = (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: '#fff',
                color: '#1e293b',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
            }}
        >
            <Toolbar sx={{ display: 'flex', gap: 2, minHeight: '64px !important' }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={() => {}}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 4,
                    width: '100%'
                }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ 
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: '#1e293b',
                            flexShrink: 0
                        }}
                    >
                        Project Management
                    </Typography>
                    
                    <Breadcrumbs 
                        separator={
                            <NavigateNextIcon 
                                fontSize="small" 
                                sx={{ color: '#94a3b8' }}
                            />
                        }
                        aria-label="breadcrumb"
                        sx={{
                            '& .MuiBreadcrumbs-ol': {
                                flexWrap: 'nowrap'
                            }
                        }}
                    >
                        {renderBreadcrumbs().map((path, index) => {
                            const isLast = index === renderBreadcrumbs().length - 1;
                            return isLast ? (
                                <Typography
                                    key={path.name}
                                    color="text.primary"
                                    sx={{ 
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#1e293b',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {path.name}
                                </Typography>
                            ) : (
                                <Link
                                    key={path.name}
                                    color="inherit"
                                    href={path.path}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (path.onClick) {
                                            path.onClick();
                                        } else {
                                            navigate(path.path);
                                        }
                                    }}
                                    sx={{ 
                                        fontSize: '0.875rem',
                                        textDecoration: 'none',
                                        color: '#64748b',
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            color: '#1e293b',
                                            textDecoration: 'none'
                                        }
                                    }}
                                >
                                    {path.name}
                                </Link>
                            );
                        })}
                    </Breadcrumbs>
                </Box>
            </Toolbar>
        </AppBar>
    );

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const [projectResponse, sprintsResponse, epicsResponse, backlogsResponse] = await Promise.all([
                    ProjectService.getProjectById(id),
                    SprintService.getAll(),
                    EpicService.getByProject(id),
                    BacklogService.getAll()
                ]);

                if (projectResponse.data) {
                    setProject(projectResponse.data);
                }
                if (sprintsResponse.data) {
                    const projectSprints = sprintsResponse.data.filter(sprint => 
                        sprint.project?._id === id || sprint.project === id
                    );
                    setSprints(projectSprints);
                }
                if (epicsResponse.data) {
                    setEpics(epicsResponse.data);
                }
                if (backlogsResponse.data) {
                    const projectBacklogs = backlogsResponse.data.filter(backlog => 
                        backlog.project?._id === id || backlog.project === id
                    );
                    setBacklogs(projectBacklogs);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Error fetching project details');
                setLoading(false);
            }
        };

        if (id) {
            fetchProjectData();
        }
    }, [id]);

    useEffect(() => {
        const handleStorageChange = () => {
            const newProjectType = localStorage.getItem('projectType');
            setProjectType(newProjectType);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
    }

    if (error) {
        return <Box sx={{ color: 'error.main', p: 2 }}>{error}</Box>;
    }

    if (!project) {
        return <Box sx={{ p: 2 }}>Project not found</Box>;
    }

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh',
            overflow: 'hidden',
            bgcolor: '#f8fafc'
        }}>
            {topNavBar}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: 'calc(100vh - 64px)',
                mt: '64px'
            }}>
                <Box sx={{ 
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    {/* Left side - Vertical Sections */}
                    <Box sx={{ 
                        width: '240px',
                        backgroundColor: '#fff',
                        borderRight: '1px solid rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto'
                    }}>
                        {/* Epics Section */}
                        <Box>
                            <Typography
                                variant="subtitle2"
                                onClick={() => handleSectionClick('epic')}
                                sx={{
                                    px: 3,
                                    py: 2.5,
                                    backgroundColor: selectedType === 'epic' && showTable ? 'rgba(59, 130, 246, 0.08)' : '#fff',
                                    color: selectedType === 'epic' && showTable ? '#2563eb' : '#64748b',
                                    fontWeight: 600,
                                    fontSize: '0.813rem',
                                    letterSpacing: '0.3px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    borderLeft: selectedType === 'epic' && showTable ? '3px solid #2563eb' : '3px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(59, 130, 246, 0.04)',
                                        color: '#2563eb'
                                    }
                                }}
                            >
                                <AssignmentIcon 
                                    fontSize="small" 
                                    sx={{ 
                                        color: 'inherit',
                                        fontSize: '1.25rem'
                                    }} 
                                />
                                EPICS
                            </Typography>
                        </Box>

                        {/* Backlogs Section - Only show for Scrum projects */}
                        {projectType !== 'Kanban' && (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    onClick={() => handleSectionClick('backlog')}
                                    sx={{
                                        px: 3,
                                        py: 2.5,
                                        backgroundColor: selectedType === 'backlog' && showTable ? 'rgba(59, 130, 246, 0.08)' : '#fff',
                                        color: selectedType === 'backlog' && showTable ? '#2563eb' : '#64748b',
                                        fontWeight: 600,
                                        fontSize: '0.813rem',
                                        letterSpacing: '0.3px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        borderLeft: selectedType === 'backlog' && showTable ? '3px solid #2563eb' : '3px solid transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(59, 130, 246, 0.04)',
                                            color: '#2563eb'
                                        }
                                    }}
                                >
                                    <ViewListIcon 
                                        fontSize="small" 
                                        sx={{ 
                                            color: 'inherit',
                                            fontSize: '1.25rem'
                                        }} 
                                    />
                                    BACKLOGS
                                </Typography>
                            </Box>
                        )}

                        {/* Sprints Section - Only show for Scrum projects */}
                        {projectType !== 'Kanban' && (
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    onClick={() => handleSectionClick('sprint')}
                                    sx={{
                                        px: 3,
                                        py: 2.5,
                                        backgroundColor: selectedType === 'sprint' && showTable ? 'rgba(59, 130, 246, 0.08)' : '#fff',
                                        color: selectedType === 'sprint' && showTable ? '#2563eb' : '#64748b',
                                        fontWeight: 600,
                                        fontSize: '0.813rem',
                                        letterSpacing: '0.3px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        borderLeft: selectedType === 'sprint' && showTable ? '3px solid #2563eb' : '3px solid transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(59, 130, 246, 0.04)',
                                            color: '#2563eb'
                                        }
                                    }}
                                >
                                    <BugReportIcon 
                                        fontSize="small" 
                                        sx={{ 
                                            color: 'inherit',
                                            fontSize: '1.25rem'
                                        }} 
                                    />
                                    SPRINTS
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Right side - Content */}
                    <Box sx={{ 
                        flex: 1,
                        backgroundColor: '#f8fafc',
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{
                            flex: 1,
                            p: 4,
                            minHeight: '100%'
                        }}>
                            {showTable ? renderTable() : renderMainContent()}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ProjectDetails;