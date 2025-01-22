import React, { useState, useEffect, useCallback } from 'react';
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
    IconButton,
    Avatar,
    ToggleButton,
    ToggleButtonGroup,
    Card,
    CardContent,
    CardActions,
    Chip,
    FormControl,
    Select,
    MenuItem,
    TableContainer,
    Paper
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
import AddIcon from '@mui/icons-material/Add';
import TableViewIcon from '@mui/icons-material/TableView';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProjectService from '../service/ProjectService';
import SprintService from '../service/SprintService';
import EpicService from '../service/EpicService';
import BacklogService from '../service/BacklogService';
import AddEpic from '../Epic/AddEpic';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
    EPIC: 'epic'
};

const EpicCard = ({ epic, onDrop }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.EPIC,
        item: { id: epic._id, status: epic.status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }));

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move'
            }}
        >
            <Card sx={{
                '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease'
                }
            }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {epic.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {epic.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={epic.status || 'to do'}
                                onChange={(e) => handleStatusChange(epic._id, e.target.value)}
                                sx={{ height: 32 }}
                            >
                                <MenuItem value="to do">To Do</MenuItem>
                                <MenuItem value="in progress">In Progress</MenuItem>
                                <MenuItem value="done">Completed</MenuItem>
                            </Select>
                        </FormControl>
                        <Chip 
                            label={epic.priority}
                            size="small"
                            color={
                                epic.priority === 'high' ? 'error' :
                                epic.priority === 'medium' ? 'warning' : 'info'
                            }
                            variant="outlined"
                        />
                    </Box>
                    {epic.startDate && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            Start: {new Date(epic.startDate).toLocaleDateString()}
                        </Typography>
                    )}
                    {epic.dueDate && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            Due: {new Date(epic.dueDate).toLocaleDateString()}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={() => handleItemClick(epic, 'epic')}>
                        View Details
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
};

const StatusColumn = ({ status, title, epics, onDrop }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.EPIC,
        drop: (item) => onDrop(item.id, status),
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }));

    return (
        <Box
            ref={drop}
            sx={{
                width: 300,
                minWidth: 300,
                bgcolor: isOver ? 'action.hover' : 'background.paper',
                borderRadius: 1,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.2s ease'
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>
                {title} ({epics?.length || 0})
            </Typography>
            <Box sx={{ 
                minHeight: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                {epics?.map((epic, index) => (
                    <EpicCard 
                        key={epic._id} 
                        epic={epic} 
                        index={index}
                    />
                ))}
            </Box>
        </Box>
    );
};

const ProjectDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
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
    const [projectKey, setProjectKey] = useState('');
    const [openAddEpicDialog, setOpenAddEpicDialog] = useState(false);
    const [epicViewMode, setEpicViewMode] = useState('table');
    const [epicsByStatus, setEpicsByStatus] = useState({
        'to do': [],
        'in progress': [],
        'done': []
    });
    const [activeId, setActiveId] = useState(null);
    const [activeEpic, setActiveEpic] = useState(null);

    // Constants for status values
    const STATUS = {
        TODO: 'to do',
        IN_PROGRESS: 'in progress',
        DONE: 'done'
    };

    const DISPLAY_STATUS = {
        'to do': 'To Do',
        'in progress': 'In Progress',
        'done': 'Completed'
    };

    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            try {
                const projectResponse = await ProjectService.getProjectById(id);
                setProject(projectResponse.data);
                setProjectKey(projectResponse.data.key);

                const epicResponse = await EpicService.getByProject(id);
                console.log('Epic data from server:', epicResponse.data); // Debug log
                setEpics(epicResponse.data);

                const sprintResponse = await SprintService.getByProject(id);
                setSprints(sprintResponse.data);

                const backlogResponse = await BacklogService.getByProject(id);
                setBacklogs(backlogResponse.data);

            } catch (err) {
                console.error('Error fetching project data:', err);
                setError(err.message);
            } finally {
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

    useEffect(() => {
        const animation = requestAnimationFrame(() => {
            // setEnabled(true);
        });

        return () => {
            cancelAnimationFrame(animation);
            // setEnabled(false);
        };
    }, []);

    useEffect(() => {
        if (epics.length > 0) {
            console.log('Current epics:', epics);
            
            // Initialize all status arrays
            const grouped = {
                [STATUS.TODO]: [],
                [STATUS.IN_PROGRESS]: [],
                [STATUS.DONE]: []
            };
            
            // Group epics by status
            epics.forEach(epic => {
                const status = epic.status || STATUS.TODO;
                if (grouped[status]) {
                    grouped[status].push(epic);
                } else {
                    grouped[STATUS.TODO].push(epic);
                }
            });
            
            console.log('Grouped epics:', grouped);
            setEpicsByStatus(grouped);
        }
    }, [epics]);

    const handleStatusChange = async (epicId, newStatus) => {
        console.log('Changing status:', { epicId, newStatus });
        const epic = epics.find(e => e._id === epicId);
        if (!epic) {
            console.error('Epic not found:', epicId);
            return;
        }

        try {
            const updateData = {
                name: epic.name,
                description: epic.description,
                priority: epic.priority,
                startDate: epic.startDate,
                dueDate: epic.dueDate,
                project: id,
                status: newStatus.toLowerCase()
            };
            
            console.log('Sending update for epic:', updateData);
            await EpicService.update(epicId, updateData);
            
            // Refresh epics
            const response = await EpicService.getByProject(id);
            setEpics(response.data);
        } catch (error) {
            console.error('Error updating epic status:', error.response?.data || error.message);
            setError('Failed to update epic status. Please try again.');
        }
    };

    const getStatusDisplay = (backendStatus) => {
        const statusMap = {
            'todo': 'to do',
            'progress': 'in progress',
            'done': 'completed'
        };
        return statusMap[backendStatus] || 'to do';
    };

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

    const handleEpicViewChange = (event, newView) => {
        if (newView !== null) {
            setEpicViewMode(newView);
        }
    };

    const handleDrop = async (epicId, newStatus) => {
        try {
            const epic = epics.find(e => e._id === epicId);
            if (!epic) {
                console.error('Epic not found:', epicId);
                return;
            }

            // Optimistically update the UI
            const newEpicsByStatus = { ...epicsByStatus };
            const oldStatus = epic.status;
            
            // Remove from old status
            newEpicsByStatus[oldStatus] = newEpicsByStatus[oldStatus]
                .filter(e => e._id !== epicId);
            
            // Add to new status
            const updatedEpic = { ...epic, status: newStatus };
            newEpicsByStatus[newStatus] = [...(newEpicsByStatus[newStatus] || []), updatedEpic];
            
            setEpicsByStatus(newEpicsByStatus);

            // Update in backend
            const updateData = {
                ...epic,
                status: newStatus,
                project: id
            };
            delete updateData._id;
            
            console.log('Updating epic status via drag:', updateData);
            await EpicService.update(epicId, updateData);
            
            // Refresh epics to ensure sync
            const response = await EpicService.getByProject(id);
            setEpics(response.data);
        } catch (error) {
            console.error('Error updating epic status:', error.response?.data || error.message);
            setError('Failed to update epic status. Please try again.');
            
            // Revert optimistic update on error
            const response = await EpicService.getByProject(id);
            setEpics(response.data);
        }
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

    const renderEpicTable = () => {
        return (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {epics.map((epic) => (
                            <TableRow key={epic._id}>
                                <TableCell>{epic.name}</TableCell>
                                <TableCell>{epic.description}</TableCell>
                                <TableCell>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <Select
                                            value={epic.status || STATUS.TODO}
                                            onChange={(e) => handleStatusChange(epic._id, e.target.value)}
                                            sx={{ height: 32 }}
                                        >
                                            <MenuItem value={STATUS.TODO}>To Do</MenuItem>
                                            <MenuItem value={STATUS.IN_PROGRESS}>In Progress</MenuItem>
                                            <MenuItem value={STATUS.DONE}>Completed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={epic.priority}
                                        size="small"
                                        color={
                                            epic.priority === 'high' ? 'error' :
                                            epic.priority === 'medium' ? 'warning' : 'info'
                                        }
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    {epic.startDate ? new Date(epic.startDate).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                    {epic.dueDate ? new Date(epic.dueDate).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleItemClick(epic, 'epic')}
                                        title="View Details"
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderEpicCard = (epic, index) => {
        console.log('Rendering epic card:', epic); // Debug log
        return (
            <Card
                key={epic._id}
                sx={{ 
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease'
                    }
                }}
            >
                <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                        {epic.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {epic.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={epic.status || STATUS.TODO}
                                onChange={(e) => handleStatusChange(epic._id, e.target.value)}
                                sx={{ height: 32 }}
                            >
                                <MenuItem value={STATUS.TODO}>To Do</MenuItem>
                                <MenuItem value={STATUS.IN_PROGRESS}>In Progress</MenuItem>
                                <MenuItem value={STATUS.DONE}>Completed</MenuItem>
                            </Select>
                        </FormControl>
                        <Chip 
                            label={epic.priority}
                            size="small"
                            color={
                                epic.priority === 'high' ? 'error' :
                                epic.priority === 'medium' ? 'warning' : 'info'
                            }
                            variant="outlined"
                        />
                    </Box>
                    {epic.startDate && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            Start: {new Date(epic.startDate).toLocaleDateString()}
                        </Typography>
                    )}
                    {epic.dueDate && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            Due: {new Date(epic.dueDate).toLocaleDateString()}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={() => handleItemClick(epic, 'epic')}>
                        View Details
                    </Button>
                </CardActions>
            </Card>
        );
    };

    const renderEpicCards = () => {
        const statusColumns = [
            { id: STATUS.TODO, title: 'To Do' },
            { id: STATUS.IN_PROGRESS, title: 'In Progress' },
            { id: STATUS.DONE, title: 'Completed' }
        ];

        return (
            <DndProvider backend={HTML5Backend}>
                <Box sx={{ display: 'flex', gap: 2, p: 2, overflowX: 'auto' }}>
                    {statusColumns.map(column => (
                        <StatusColumn
                            key={column.id}
                            status={column.id}
                            title={column.title}
                            epics={epicsByStatus[column.id]}
                            onDrop={handleDrop}
                        />
                    ))}
                </Box>
            </DndProvider>
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
                zIndex: 1100,
                backgroundColor: '#1976d2',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
        >
            <Toolbar sx={{ minHeight: '64px !important' }}>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Breadcrumbs 
                    separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
                    aria-label="breadcrumb"
                    sx={{ flex: 1, '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' } }}
                >
                    <Link
                        color="inherit"
                        href="/"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'white',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Home
                    </Link>
                    <Link
                        color="inherit"
                        href="/projects"
                        sx={{ 
                            color: 'white',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        Projects
                    </Link>
                    <Typography color="rgba(255,255,255,0.7)">
                        {project?.name || 'Project Details'}
                    </Typography>
                </Breadcrumbs>
                <IconButton color="inherit">
                    <AccountCircleIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );

    const handleNavigation = (path) => {
        navigate(path);
    };

    // Add Epic dialog handlers
    const handleOpenAddEpicDialog = () => {
        setOpenAddEpicDialog(true);
    };

    const handleCloseAddEpicDialog = () => {
        setOpenAddEpicDialog(false);
    };

    const handleEpicAdded = async () => {
        try {
            const response = await EpicService.getByProject(id);
            setEpics(response.data);
            handleCloseAddEpicDialog();
        } catch (error) {
            console.error('Error fetching epics:', error);
        }
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Navbar */}
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: 1100,
                    backgroundColor: '#1976d2',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}
            >
                <Toolbar sx={{ minHeight: '64px !important' }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Breadcrumbs 
                        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
                        aria-label="breadcrumb"
                        sx={{ flex: 1, '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' } }}
                    >
                        <Link
                            color="inherit"
                            href="/"
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'white',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                            Home
                        </Link>
                        <Link
                            color="inherit"
                            href="/projects"
                            sx={{ 
                                color: 'white',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Projects
                        </Link>
                        <Typography color="rgba(255,255,255,0.7)">
                            {project?.name || 'Project Details'}
                        </Typography>
                    </Breadcrumbs>
                    <IconButton color="inherit">
                        <AccountCircleIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* Left side - Vertical Sections */}
                <Box sx={{ 
                    width: '240px',
                    backgroundColor: '#fff',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 64,
                    color: '#1976d2',
                    zIndex: 100
                }}>
                    {/* Project Key Avatar */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        px: 3,
                        py: 3,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        mb: 1
                    }}>
                        <Avatar 
                            sx={{ 
                                bgcolor: '#1976d2',
                                width: 40,
                                height: 40,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                mr: 2
                            }}
                        >
                            {projectKey?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: '#1976d2',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    lineHeight: 1.2
                                }}
                            >
                                {projectKey}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'rgba(25, 118, 210, 0.7)',
                                    fontSize: '0.75rem'
                                }}
                            >
                                {project?.name || 'Project'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Menu Items */}
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {/* Epics Section */}
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="subtitle2"
                                onClick={() => handleSectionClick('epic')}
                                sx={{
                                    px: 3,
                                    py: 2.5,
                                    backgroundColor: selectedType === 'epic' && showTable ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                    color: selectedType === 'epic' && showTable ? '#1976d2' : 'rgba(25, 118, 210, 0.7)',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    letterSpacing: '0.3px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                        color: '#1976d2'
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
                                        backgroundColor: selectedType === 'backlog' && showTable ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                        color: selectedType === 'backlog' && showTable ? '#1976d2' : 'rgba(25, 118, 210, 0.7)',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.3px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            color: '#1976d2'
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
                                        backgroundColor: selectedType === 'sprint' && showTable ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                        color: selectedType === 'sprint' && showTable ? '#1976d2' : 'rgba(25, 118, 210, 0.7)',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.3px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            color: '#1976d2'
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
                </Box>

                {/* Right side - Content Area */}
                <Box 
                    component="main"
                    sx={{ 
                        flex: 1,
                        ml: '240px',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100vh',
                        position: 'relative'
                    }}
                >
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 128,
                            left: '240px',
                            right: 0,
                            bottom: 0,
                            backgroundColor: '#fff',
                            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                            borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 1
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '24px',
                                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.05)',
                            }}
                        >
                            {selectedType === 'epic' && !selectedItem && (
                                <Box sx={{ 
                                    mb: 3, 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <ToggleButtonGroup
                                        value={epicViewMode}
                                        exclusive
                                        onChange={handleEpicViewChange}
                                        size="small"
                                        sx={{ 
                                            '& .MuiToggleButton-root.Mui-selected': {
                                                backgroundColor: '#1976d2',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#1565c0'
                                                }
                                            }
                                        }}
                                    >
                                        <ToggleButton value="table" aria-label="table view">
                                            <TableViewIcon />
                                        </ToggleButton>
                                        <ToggleButton value="card" aria-label="card view">
                                            <ViewModuleIcon />
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleOpenAddEpicDialog}
                                        startIcon={<AddIcon />}
                                        sx={{
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Create Epic
                                    </Button>
                                </Box>
                            )}
                            {selectedType === 'epic' ? (
                                selectedItem ? (
                                    renderMainContent()
                                ) : (
                                    epicViewMode === 'table' ? renderEpicTable() : renderEpicCards()
                                )
                            ) : (
                                showTable ? renderTable() : renderMainContent()
                            )}
                            
                            {/* Add Epic Dialog */}
                            <AddEpic
                                open={openAddEpicDialog}
                                onClose={handleCloseAddEpicDialog}
                                projectId={id}
                                onEpicAdded={handleEpicAdded}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ProjectDetails;