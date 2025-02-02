import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Avatar,
    AppBar,
    Toolbar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Alert,
    CircularProgress,
    LinearProgress,
    TextField,
    Breadcrumbs,
    Link,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SpeedIcon from '@mui/icons-material/Speed';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import GroupIcon from '@mui/icons-material/Group';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import BugReportIcon from '@mui/icons-material/BugReport';
import ViewListIcon from '@mui/icons-material/ViewList';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BugIcon from '@mui/icons-material/BugReport';

import ProjectService from '../service/ProjectService';
import SprintService from '../service/SprintService';
import EpicService from '../service/EpicService';
import BacklogService from '../service/BacklogService';
import BacklogItemService from '../service/BacklogItemService';
import AddEpic from '../Epic/AddEpic';
import AddBacklog from '../Backlog/AddBacklog';
import StatusColumn from './StatusColumn';
import EpicCard from './EpicCard';
import IssueList from '../Issue/IssueList';

const ItemTypes = {
    EPIC: 'epic'
};

const ProjectDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [epics, setEpics] = useState([]);
    const [backlogs, setBacklogs] = useState([]);
    const [backlogItems, setBacklogItems] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('epics');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState(null);
    const [openAddBacklogDialog, setOpenAddBacklogDialog] = useState(false);
    const [editBacklogDialogOpen, setEditBacklogDialogOpen] = useState(false);
    const [editedBacklogName, setEditedBacklogName] = useState('');
    const [editedBacklogId, setEditedBacklogId] = useState(null);
    const [projectType, setProjectType] = useState(localStorage.getItem('projectType'));
    const [projectKey, setProjectKey] = useState('');
    const [openAddEpicDialog, setOpenAddEpicDialog] = useState(false);
    const [epicViewMode, setEpicViewMode] = useState('cards');
    const [epicsByStatus, setEpicsByStatus] = useState({
        'to do': [],
        'in progress': [],
        'done': []
    });
    const [selectedEpic, setSelectedEpic] = useState(null);
    const [epicDetailsOpen, setEpicDetailsOpen] = useState(false);
    const [editEpicDialogOpen, setEditEpicDialogOpen] = useState(false);
    const [editedEpic, setEditedEpic] = useState(null);
    const [addIssueDialogOpen, setAddIssueDialogOpen] = useState(false);

    // Constants for status values
    const STATUS = {
        TODO: 'to do',
        IN_PROGRESS: 'in progress',
        DONE: 'done'
    };

    const DISPLAY_STATUS = {
        'to do': 'To Do',
        'in progress': 'In Progress',
        'done': 'Done'
    };

    const getItemIcon = (item) => {
        switch (item) {
            case 'epics':
                return <AssignmentIcon />;
            case 'backlog':
                return <ViewModuleIcon />;
            case 'sprints':
                return <BugReportIcon />;
            case 'issues':
                return <BugIcon />;
            case 'backlogItems':
                return <ListAltIcon />;
            default:
                return null;
        }
    };

    const renderSidebar = () => {
        const sidebarItems = [
            { id: 'epics', icon: <AssignmentIcon />, label: 'Epics' },
            { id: 'backlog', icon: <ViewModuleIcon />, label: 'Backlog' },
            { id: 'backlogItems', icon: <ListAltIcon />, label: 'Backlog Items' },
            { id: 'sprints', icon: <BugReportIcon />, label: 'Sprints' },
            { id: 'issues', icon: <BugIcon />, label: 'Issues' }
        ];

        return (
            <Box sx={{ 
                width: '240px',
                backgroundColor: '#fff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 64,
                color: '#1e40af',
                zIndex: 100,
                transition: 'all 0.3s ease'
            }}>
                {/* Project Key Avatar */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    px: 3,
                    py: 3,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    mb: 1,
                    background: 'linear-gradient(to right, rgba(30, 64, 175, 0.05), transparent)'
                }}>
                    <Avatar 
                        sx={{ 
                            bgcolor: '#1e40af',
                            width: 40,
                            height: 40,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            mr: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            border: '2px solid #fff'
                        }}
                    >
                        {projectKey}
                    </Avatar>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: '#1e293b',
                        fontSize: '1.1rem'
                    }}>
                        {project?.name}
                    </Typography>
                </Box>

                {/* Navigation Items */}
                <Box sx={{ flex: 1, py: 2 }}>
                    {sidebarItems.map((item) => (
                        <Button
                            key={item.id}
                            startIcon={item.icon}
                            onClick={() => handleItemTypeSelect(item.id)}
                            sx={{
                                justifyContent: 'flex-start',
                                px: 3,
                                py: 1.5,
                                width: '100%',
                                color: selectedType === item.id ? '#fff' : '#64748b',
                                backgroundColor: selectedType === item.id ? '#1e40af' : 'transparent',
                                borderRadius: 0,
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: selectedType === item.id ? '#1e40af' : 'rgba(30, 64, 175, 0.08)',
                                    color: selectedType === item.id ? '#fff' : '#1e40af',
                                    '&::before': {
                                        width: '4px'
                                    }
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: selectedType === item.id ? '4px' : '0px',
                                    height: '100%',
                                    backgroundColor: '#1e40af',
                                    transition: 'width 0.2s ease'
                                },
                                textTransform: 'capitalize',
                                letterSpacing: '0.5px',
                                fontSize: '0.95rem',
                                fontWeight: selectedType === item.id ? 600 : 500
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>
            </Box>
        );
    };

    const handleItemTypeSelect = (type) => {
        setSelectedType(type);
        setSelectedItem(null);
    };

    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            try {
                const projectResponse = await ProjectService.getProjectById(id);
                setProject(projectResponse.data);
                setProjectKey(projectResponse.data.key);

                const backlogResponse = await BacklogService.getByProject(id);
                setBacklogs(backlogResponse.data);

                const epicResponse = await EpicService.getByProject(id);
                setEpics(epicResponse.data);

                const sprintResponse = await SprintService.getByProject(id);
                setSprints(sprintResponse.data);
            } catch (err) {
                console.error('Error fetching project data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
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
        if (epics.length > 0) {
            const grouped = {
                'to do': epics.filter(epic => epic.status === STATUS.TODO),
                'in progress': epics.filter(epic => epic.status === STATUS.IN_PROGRESS),
                'done': epics.filter(epic => epic.status === STATUS.DONE)
            };
            setEpicsByStatus(grouped);
        }
    }, [epics]);

    const getStatusDisplay = (status) => {
        return DISPLAY_STATUS[status] || DISPLAY_STATUS['to do'];
    };

    const handleStatusChange = async (epicId, newStatus) => {
        try {
            const epicToUpdate = epics.find(e => e._id === epicId);
            if (!epicToUpdate) return;

            // Update locally first for immediate feedback
            const updatedEpic = { ...epicToUpdate, status: newStatus };
            const updatedEpics = epics.map(e => 
                e._id === epicId ? updatedEpic : e
            );
            setEpics(updatedEpics);

            // Update epicsByStatus
            const newEpicsByStatus = {
                'to do': updatedEpics.filter(e => e.status === STATUS.TODO),
                'in progress': updatedEpics.filter(e => e.status === STATUS.IN_PROGRESS),
                'done': updatedEpics.filter(e => e.status === STATUS.DONE)
            };
            setEpicsByStatus(newEpicsByStatus);

            // Update in backend
            await EpicService.update(epicId, {
                ...epicToUpdate,
                status: newStatus
            });

        } catch (error) {
            console.error('Error updating epic status:', error);
            // Revert changes if update fails
            const originalEpics = [...epics];
            setEpics(originalEpics);
            setError('Failed to update epic status');
        }
    };

    const handleEpicClick = (epic) => {
        setSelectedEpic(epic);
        setEpicDetailsOpen(true);
    };

    const handleBacklogClick = (backlog) => {
        setSelectedItem(backlog);
        setSelectedType('backlog');
    };

    const handleSectionClick = (type) => {
        setSelectedType(type);
        setSelectedItem(null);
    };

    const handleEpicViewChange = (event, newView) => {
        if (newView !== null) {
            setEpicViewMode(newView);
        }
    };

    const handleDrop = async (epicId, newStatus) => {
        try {
            const epicToUpdate = epics.find(e => e._id === epicId);
            if (!epicToUpdate) return;

            // Update locally first for immediate feedback
            const updatedEpic = { ...epicToUpdate, status: newStatus };
            const updatedEpics = epics.map(e => 
                e._id === epicId ? updatedEpic : e
            );
            setEpics(updatedEpics);

            // Update epicsByStatus
            const newEpicsByStatus = {
                'to do': updatedEpics.filter(e => e.status === STATUS.TODO),
                'in progress': updatedEpics.filter(e => e.status === STATUS.IN_PROGRESS),
                'done': updatedEpics.filter(e => e.status === STATUS.DONE)
            };
            setEpicsByStatus(newEpicsByStatus);

            // Update in backend
            await EpicService.update(epicId, {
                ...epicToUpdate,
                status: newStatus
            });

        } catch (error) {
            console.error('Error updating epic status:', error);
            // Revert changes if update fails
            const originalEpics = [...epics];
            setEpics(originalEpics);
            setError('Failed to update epic status');
        }
    };

    const handleEditBacklog = (backlog) => {
        setSelectedBacklog(backlog);
        setEditedBacklogName(backlog.name);
        setEditBacklogDialogOpen(true);
    };

    const handleEditBacklogSave = async () => {
        try {
            await BacklogService.update(selectedBacklog._id, { name: editedBacklogName });
            setEditBacklogDialogOpen(false);
            const response = await BacklogService.getByProject(id);
            setBacklogs(response.data);
        } catch (err) {
            setError("Failed to update backlog. Please try again.");
        }
    };

    const handleDeleteBacklog = async (backlogId) => {
        try {
            await BacklogService.delete(backlogId);
            const response = await BacklogService.getByProject(id);
            setBacklogs(response.data);
        } catch (err) {
            setError("Failed to delete backlog. Please try again.");
        }
    };

    const exportToCSV = (backlog) => {
        const headers = "Backlog Name,Project,Item Title,Item Description,Item Type,Item Status\n";
        const items = backlog.items
            .map((item) => {
                if (!item) return null;
                return `${backlog.name},${project.name},${item.title},${item.description || ''},${item.type || ''},${item.status || ''}`;
            })
            .filter(Boolean)
            .join("\n");

        const csv = headers + items;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${backlog.name.replace(/\s+/g, "_")}_backlog.csv`);
    };

    const handleBacklogCreated = async () => {
        try {
            const response = await BacklogService.getByProject(id);
            setBacklogs(response.data);
            setOpenAddBacklogDialog(false);
        } catch (err) {
            setError("Failed to refresh backlogs. Please try again.");
        }
    };

    const renderTable = () => {
        let data = [];
        let columns = [];

        switch (selectedType) {
            case 'epics':
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
            case 'sprints':
                data = sprints;
                columns = [
                    { field: 'name', headerName: 'Name', flex: 1 },
                    { field: 'status', headerName: 'Status', width: 120 },
                    { 
                        field: 'startDate', 
                        headerName: 'Start Date', 
                        width: 120,
                        renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-'
                    },
                    { 
                        field: 'endDate', 
                        headerName: 'End Date', 
                        width: 120,
                        renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-'
                    }
                ];
                break;
            default:
                return null;
        }

        if (!data || data.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                        No {selectedType} found
                    </Typography>
                </Box>
            );
        }

        return (
            <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
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
                                onClick={() => handleBacklogClick(row)}
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

    const calculateProgress = (progressObj) => {
        if (!progressObj) return 0;
        if (typeof progressObj === 'number') return progressObj;
        if (typeof progressObj === 'object' && progressObj.total > 0) {
            return Math.round((progressObj.completed / progressObj.total) * 100);
        }
        return 0;
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
                                        onClick={() => handleEpicClick(epic)}
                                        title="View Details"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderEpicCard = (epic) => {
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
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
                    <Button size="small" onClick={() => handleEpicClick(epic)}>
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
                            onEpicClick={handleEpicClick}
                            onEditClick={handleEditEpic}
                            onDeleteClick={handleDeleteEpic}
                        />
                    ))}
                </Box>
            </DndProvider>
        );
    };

    const renderEpicHeader = () => (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
                <Typography variant="h5" sx={{ 
                    fontWeight: 600,
                    color: '#1e293b',
                    mb: 0.5
                }}>
                    Project Epics
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Manage and track epics for {project?.name}
                </Typography>
            </Box>
            <Box>
                <Button
                    variant="outlined"
                    onClick={() => setEpicViewMode(epicViewMode === 'table' ? 'cards' : 'table')}
                    startIcon={epicViewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
                    sx={{ mr: 2 }}
                >
                    {epicViewMode === 'table' ? 'Card View' : 'Table View'}
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddEpicDialog(true)}
                    sx={{
                        bgcolor: '#1e40af',
                        '&:hover': { bgcolor: '#1e3a8a' }
                    }}
                >
                    Add Epic
                </Button>
            </Box>
        </Box>
    );

    const renderEpicContent = () => {
        if (!epics || epics.length === 0) {
            return (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No epics found
                    </Typography>
                </Box>
            );
        }

        return (
            <Box>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<ViewModuleIcon />}
                        onClick={() => setEpicViewMode(epicViewMode === 'cards' ? 'table' : 'cards')}
                        sx={{ mr: 1 }}
                    >
                        {epicViewMode === 'cards' ? 'Table View' : 'Card View'}
                    </Button>
                </Box>

                {epicViewMode === 'cards' ? (
                    <DndProvider backend={HTML5Backend}>
                        {renderKanbanBoard()}
                    </DndProvider>
                ) : (
                    renderEpicTableContent()
                )}
            </Box>
        );
    };

    const renderKanbanBoard = () => (
        <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto',
            p: 2,
            minHeight: 600
        }}>
            <StatusColumn
                status={STATUS.TODO}
                title="To Do"
                epics={epicsByStatus[STATUS.TODO]}
                onDrop={handleDrop}
                onEpicClick={handleEpicClick}
                onEditClick={handleEditEpic}
                onDeleteClick={handleDeleteEpic}
            />
            <StatusColumn
                status={STATUS.IN_PROGRESS}
                title="In Progress"
                epics={epicsByStatus[STATUS.IN_PROGRESS]}
                onDrop={handleDrop}
                onEpicClick={handleEpicClick}
                onEditClick={handleEditEpic}
                onDeleteClick={handleDeleteEpic}
            />
            <StatusColumn
                status={STATUS.DONE}
                title="Done"
                epics={epicsByStatus[STATUS.DONE]}
                onDrop={handleDrop}
                onEpicClick={handleEpicClick}
                onEditClick={handleEditEpic}
                onDeleteClick={handleDeleteEpic}
            />
        </Box>
    );

    const renderBacklogContent = () => {
        if (!backlogs || backlogs.length === 0) {
            return (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                        No backlog items found
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper} elevation={0} sx={{ 
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                '& .MuiTableCell-head': {
                    bgcolor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0'
                },
                '& .MuiTableRow-root:hover': {
                    bgcolor: '#f1f5f9'
                },
                '& .MuiTableCell-root': {
                    borderColor: '#e2e8f0'
                }
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Progress</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {backlogs.map((backlog) => (
                            <TableRow 
                                key={backlog._id}
                                sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    '&:hover': { bgcolor: '#f8fafc' },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleBacklogClick(backlog)}
                            >
                                <TableCell sx={{ color: '#1e293b' }}>{backlog.name}</TableCell>
                                <TableCell sx={{ color: '#475569' }}>
                                    {backlog.description ? (
                                        backlog.description.length > 50 
                                            ? `${backlog.description.substring(0, 50)}...` 
                                            : backlog.description
                                    ) : 'No description'}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={backlog.status || 'to do'} 
                                        size="small"
                                        sx={{ 
                                            bgcolor: 
                                                backlog.status === 'done' ? '#dcfce7' :
                                                backlog.status === 'in progress' ? '#dbeafe' : '#f1f5f9',
                                            color: 
                                                backlog.status === 'done' ? '#059669' :
                                                backlog.status === 'in progress' ? '#2563eb' : '#475569',
                                            textTransform: 'capitalize',
                                            fontWeight: 500
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={typeof backlog.progress === 'object' ? 
                                                (backlog.progress.completed / backlog.progress.total * 100) : 
                                                backlog.progress || 0}
                                            size={24}
                                            thickness={4}
                                            sx={{ 
                                                color: ((typeof backlog.progress === 'object' ? 
                                                    (backlog.progress.completed / backlog.progress.total * 100) : 
                                                    backlog.progress || 0) >= 100) ? '#10b981' : '#3b82f6' 
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ color: '#475569' }}>
                                            {typeof backlog.progress === 'object' ? 
                                                `${(backlog.progress.completed / backlog.progress.total * 100).toFixed(0)}%` :
                                                `${backlog.progress || 0}%`
                                            }
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBacklogClick(backlog);
                                            }}
                                            sx={{ color: '#3b82f6' }}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditBacklog(backlog);
                                            }}
                                            sx={{ color: '#3b82f6' }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBacklog(backlog._id);
                                            }}
                                            sx={{ color: '#ef4444' }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderSprintContent = () => {
        return (
            <Box sx={{ p: 2 }}>
                {sprints.map((sprint) => (
                    <Paper
                        key={sprint._id}
                        elevation={0}
                        sx={{
                            mb: 3,
                            border: '1px solid #e2e8f0',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}
                    >
                        <Box
                            sx={{
                                p: 2,
                                borderBottom: '1px solid #e2e8f0',
                                bgcolor: '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box>
                                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 0.5 }}>
                                    {sprint.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarTodayIcon sx={{ color: '#64748b', fontSize: '0.875rem' }} />
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={sprint.status}
                                        size="small"
                                        sx={{
                                            bgcolor: 
                                                sprint.status === 'completed' ? '#10b981' :
                                                sprint.status === 'active' ? '#3b82f6' :
                                                sprint.status === 'planned' ? '#f59e0b' : '#e2e8f0',
                                            color: sprint.status === 'planned' ? '#1e293b' : 'white',
                                            fontWeight: 500,
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleSprintClick(sprint)}
                                    sx={{ 
                                        color: '#64748b',
                                        '&:hover': { 
                                            bgcolor: '#f1f5f9',
                                            color: '#3b82f6'
                                        }
                                    }}
                                >
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEditSprint(sprint)}
                                    sx={{ 
                                        color: '#64748b',
                                        '&:hover': { 
                                            bgcolor: '#f1f5f9',
                                            color: '#3b82f6'
                                        }
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteSprint(sprint)}
                                    sx={{ 
                                        color: '#64748b',
                                        '&:hover': { 
                                            bgcolor: '#fee2e2',
                                            color: '#ef4444'
                                        }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ p: 2 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ color: '#475569', mb: 2, whiteSpace: 'pre-wrap' }}>
                                    {sprint.description || 'No description provided'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={calculateProgress(sprint.progress)}
                                                size={40}
                                                thickness={4}
                                                sx={{ color: calculateProgress(sprint.progress) >= 100 ? '#10b981' : '#3b82f6' }}
                                            />
                                            <Box
                                                sx={{
                                                    top: 0,
                                                    left: 0,
                                                    bottom: 0,
                                                    right: 0,
                                                    position: 'absolute',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                                    {calculateProgress(sprint.progress)}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            Progress
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AssignmentIcon sx={{ color: '#3b82f6', fontSize: '1.25rem' }} />
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            {sprint.tasks ? sprint.tasks.length : 0} Tasks
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <GroupIcon sx={{ color: '#3b82f6', fontSize: '1.25rem' }} />
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            {sprint.assignees ? sprint.assignees.length : 0} Members
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {sprint.tasks && sprint.tasks.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ color: '#1e293b', fontWeight: 600, mb: 1.5 }}>
                                        Tasks
                                    </Typography>
                                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Title</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Assignee</TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Due Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sprint.tasks.map((task, index) => (
                                                    <TableRow 
                                                        key={task._id || index}
                                                        sx={{ 
                                                            '&:last-child td, &:last-child th': { border: 0 },
                                                            '&:hover': { bgcolor: '#f8fafc' }
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: '#1e293b' }}>{task.title}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={task.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: 
                                                                        task.status === 'completed' ? '#dcfce7' :
                                                                        task.status === 'in progress' ? '#dbeafe' : '#f1f5f9',
                                                                    color: 
                                                                        task.status === 'completed' ? '#10b981' :
                                                                        task.status === 'in progress' ? '#3b82f6' : '#64748b',
                                                                    textTransform: 'capitalize'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#475569' }}>
                                                            {task.assignee ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                                        {task.assignee.name[0]}
                                                                    </Avatar>
                                                                    <Typography variant="body2">
                                                                        {task.assignee.name}
                                                                    </Typography>
                                                                </Box>
                                                            ) : '-'}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#475569' }}>
                                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                ))}
            </Box>
        );
    };

    const renderEpicTableContent = () => {
        if (!epics || epics.length === 0) {
            return (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                        No epics found
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Timeline</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {epics.map((epic) => {
                            const progress = calculateProgress(epic.progress);

                            return (
                                <TableRow key={epic._id}>
                                    <TableCell>{epic.name}</TableCell>
                                    <TableCell>{epic.description}</TableCell>
                                    <TableCell>
                                        <FormControl size="small" onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={epic.status || STATUS.TODO}
                                                onChange={(e) => handleEpicStatusChange(epic._id, e.target.value)}
                                                sx={{
                                                    minWidth: 120,
                                                    bgcolor: 
                                                        epic.status === STATUS.DONE ? '#dcfce7' :
                                                        epic.status === STATUS.IN_PROGRESS ? '#dbeafe' : '#f1f5f9',
                                                    color: epic.status === STATUS.TODO ? '#1e293b' : 'white',
                                                    fontWeight: 500
                                                }}
                                            >
                                                <MenuItem value={STATUS.TODO}>To Do</MenuItem>
                                                <MenuItem value={STATUS.IN_PROGRESS}>In Progress</MenuItem>
                                                <MenuItem value={STATUS.DONE}>Done</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={epic.priority || 'Medium'} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: 
                                                    epic.priority === 'high' ? '#ef4444' :
                                                    epic.priority === 'medium' ? '#f59e0b' : '#3b82f6',
                                                color: 'white',
                                                fontWeight: 500
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={progress}
                                                size={24}
                                                thickness={4}
                                                sx={{ color: progress >= 100 ? '#10b981' : '#3b82f6' }}
                                            />
                                            <Typography variant="body2">
                                                {progress}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {epic.startDate ? new Date(epic.startDate).toLocaleDateString() : 'Not set'} 
                                            {' - '}
                                            {epic.dueDate ? new Date(epic.dueDate).toLocaleDateString() : 'Not set'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEpicClick(epic)}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditEpic(epic)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteEpic(epic._id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const handleEpicStatusChange = async (epicId, newStatus) => {
        try {
            const epicToUpdate = epics.find(e => e._id === epicId);
            if (!epicToUpdate) return;

            // Update locally first for immediate feedback
            const updatedEpics = epics.map(epic => 
                epic._id === epicId ? { ...epic, status: newStatus } : epic
            );
            setEpics(updatedEpics);

            // Update on the server with complete epic data
            await EpicService.updateEpicStatus(epicId, { 
                ...epicToUpdate,
                status: newStatus 
            });
        } catch (error) {
            console.error('Error updating epic status:', error);
            // Revert the local change if the server update fails
            const originalEpics = epics.map(epic => 
                epic._id === epicId ? { ...epic, status: epic.status } : epic
            );
            setEpics(originalEpics);
        }
    };

    const renderBreadcrumbs = () => {
        const pathSegments = [
            { name: 'Home', icon: <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />, path: '/' },
            { name: 'Projects', icon: <ViewListIcon sx={{ mr: 0.5 }} fontSize="inherit" />, path: '/projects' },
            { name: project?.name || 'Project Details', icon: <AssignmentIcon sx={{ mr: 0.5 }} fontSize="inherit" /> }
        ];

        if (selectedType === 'backlog') {
            pathSegments.push({ name: 'Backlog', icon: <ViewModuleIcon sx={{ mr: 0.5 }} fontSize="inherit" /> });
        } else if (selectedType === 'epics') {
            pathSegments.push({ name: 'Epics', icon: <AssignmentIcon sx={{ mr: 0.5 }} fontSize="inherit" /> });
        } else if (selectedType === 'sprints') {
            pathSegments.push({ name: 'Sprints', icon: <BugReportIcon sx={{ mr: 0.5 }} fontSize="inherit" /> });
        }

        return (
            <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />}
                sx={{ 
                    flex: 1,
                    '& .MuiBreadcrumbs-li': {
                        display: 'flex',
                        alignItems: 'center'
                    }
                }}
            >
                {pathSegments.map((segment, index) => {
                    const isLast = index === pathSegments.length - 1;
                    
                    if (isLast) {
                        return (
                            <Typography
                                key={segment.name}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontWeight: 'medium'
                                }}
                            >
                                {segment.icon}
                                {segment.name}
                            </Typography>
                        );
                    }

                    return (
                        <Link
                            key={segment.name}
                            component={RouterLink}
                            to={segment.path}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: '#fff',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: '#fff'
                                }
                            }}
                        >
                            {segment.icon}
                            {segment.name}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        );
    };

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

    const handleCloseEpicDetails = () => {
        setEpicDetailsOpen(false);
        setSelectedEpic(null);
    };

    const renderEpicDetails = () => {
        if (!selectedEpic) return null;

        const progress = calculateProgress(selectedEpic.progress);

        return (
            <Dialog
                open={epicDetailsOpen}
                onClose={handleCloseEpicDetails}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', px: 3, py: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 600, mb: 1 }}>
                                {selectedEpic.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                    label={selectedEpic.status || 'To Do'} 
                                    size="small"
                                    sx={{ 
                                        bgcolor: 
                                            selectedEpic.status === 'done' ? '#10b981' :
                                            selectedEpic.status === 'in progress' ? '#3b82f6' : '#e2e8f0',
                                        color: selectedEpic.status === 'to do' ? '#1e293b' : 'white',
                                        fontWeight: 500
                                    }}
                                />
                                <Chip 
                                    label={selectedEpic.priority || 'Medium'} 
                                    size="small"
                                    sx={{ 
                                        bgcolor: 
                                            selectedEpic.priority === 'high' ? '#ef4444' :
                                            selectedEpic.priority === 'medium' ? '#f59e0b' : '#3b82f6',
                                        color: 'white',
                                        fontWeight: 500
                                    }}
                                />
                            </Box>
                        </Box>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleCloseEpicDetails}
                            aria-label="close"
                            sx={{ color: '#64748b' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AssignmentIcon sx={{ color: '#3b82f6' }} />
                                    Description
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, minHeight: 100 }}>
                                    <Typography variant="body1" sx={{ color: '#475569', whiteSpace: 'pre-wrap' }}>
                                        {selectedEpic.description || 'No description provided'}
                                    </Typography>
                                </Paper>
                            </Box>

                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BugReportIcon sx={{ color: '#3b82f6' }} />
                                    Related Issues
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    {selectedEpic.issues && selectedEpic.issues.length > 0 ? (
                                        <List disablePadding>
                                            {selectedEpic.issues.map((issue, index) => (
                                                <ListItem 
                                                    key={issue._id || index}
                                                    disablePadding
                                                    sx={{ 
                                                        py: 1,
                                                        borderBottom: index < selectedEpic.issues.length - 1 ? '1px solid #e2e8f0' : 'none'
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={issue.title}
                                                        secondary={issue.status}
                                                        primaryTypographyProps={{ sx: { color: '#1e293b' } }}
                                                        secondaryTypographyProps={{ sx: { color: '#64748b' } }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            No issues linked to this epic
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SpeedIcon sx={{ color: '#3b82f6' }} />
                                    Progress
                                </Typography>
                                <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                        <CircularProgress 
                                            variant="determinate" 
                                            value={progress}
                                            size={80}
                                            thickness={4}
                                            sx={{ color: progress >= 100 ? '#10b981' : '#3b82f6' }}
                                        />
                                        <Box
                                            sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                                {progress}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarTodayIcon sx={{ color: '#3b82f6' }} />
                                    Timeline
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                Start Date
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
                                                {selectedEpic.startDate ? new Date(selectedEpic.startDate).toLocaleDateString() : 'Not set'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 0.5 }}>
                                                Due Date
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 500 }}>
                                                {selectedEpic.dueDate ? new Date(selectedEpic.dueDate).toLocaleDateString() : 'Not set'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Box>

                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <GroupIcon sx={{ color: '#3b82f6' }} />
                                    Team
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                    {selectedEpic.assignees && selectedEpic.assignees.length > 0 ? (
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {selectedEpic.assignees.map((assignee, index) => (
                                                <Chip
                                                    key={assignee._id || index}
                                                    avatar={<Avatar>{assignee.name[0]}</Avatar>}
                                                    label={assignee.name}
                                                    sx={{ bgcolor: '#e2e8f0', color: '#1e293b' }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                            No team members assigned
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <Button 
                        onClick={handleCloseEpicDetails}
                        sx={{ 
                            color: '#64748b',
                            '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                    >
                        Close
                    </Button>
                    <Button 
                        onClick={() => handleEditEpic(selectedEpic)}
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{ 
                            bgcolor: '#1e40af',
                            '&:hover': { bgcolor: '#1e3a8a' }
                        }}
                    >
                        Edit Epic
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const handleEditEpic = (epic) => {
        setEditedEpic(epic);
        setEditEpicDialogOpen(true);
    };

    const handleCloseEditEpic = () => {
        setEditEpicDialogOpen(false);
        setEditedEpic(null);
    };

    const handleEditEpicSave = async () => {
        try {
            await EpicService.update(editedEpic._id, editedEpic);
            
            // Update local state
            const updatedEpics = epics.map(e => 
                e._id === editedEpic._id ? editedEpic : e
            );
            setEpics(updatedEpics);
            
            // Update epicsByStatus
            const newEpicsByStatus = {
                'to do': updatedEpics.filter(e => e.status === STATUS.TODO),
                'in progress': updatedEpics.filter(e => e.status === STATUS.IN_PROGRESS),
                'done': updatedEpics.filter(e => e.status === STATUS.DONE)
            };
            setEpicsByStatus(newEpicsByStatus);
            
            handleCloseEditEpic();
        } catch (error) {
            console.error('Error updating epic:', error);
        }
    };

    const handleDeleteEpic = async (epicId) => {
        if (!window.confirm('Are you sure you want to delete this epic?')) return;

        try {
            await EpicService.delete(epicId);
            
            // Update local state
            const updatedEpics = epics.filter(e => e._id !== epicId);
            setEpics(updatedEpics);
            
            // Update epicsByStatus
            const newEpicsByStatus = {
                'to do': updatedEpics.filter(e => e.status === STATUS.TODO),
                'in progress': updatedEpics.filter(e => e.status === STATUS.IN_PROGRESS),
                'done': updatedEpics.filter(e => e.status === STATUS.DONE)
            };
            setEpicsByStatus(newEpicsByStatus);
        } catch (error) {
            console.error('Error deleting epic:', error);
        }
    };

    const handleEditEpicChange = (field, value) => {
        setEditedEpic(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSprintClick = (sprint) => {
        setSelectedType('sprints');
        setSelectedItem(sprint);
    };

    const handleBackToSprints = () => {
        setSelectedType('sprints');
        setSelectedItem(null);
    };

    const renderContent = () => {
        if (loading) {
            return <CircularProgress />;
        }

        if (error) {
            return <Alert severity="error">{error}</Alert>;
        }

        switch (selectedType) {
            case 'epics':
                return renderEpicContent();
            case 'backlog':
                return renderBacklogContent();
            case 'sprints':
                return (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3 }}>Sprints</Typography>
                        <Grid container spacing={3}>
                            {sprints.map((sprint) => (
                                <Grid item xs={12} md={6} lg={4} key={sprint._id}>
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative'
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" gutterBottom>
                                                {sprint.name}
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Progress
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={sprint.progress || 0}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                backgroundColor: '#e2e8f0',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: 
                                                                        sprint.progress === 100 ? '#059669' :
                                                                        sprint.progress >= 70 ? '#3b82f6' :
                                                                        sprint.progress >= 30 ? '#f59e0b' : '#ef4444',
                                                                    borderRadius: 4
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            minWidth: 40,
                                                            color: 
                                                                sprint.progress === 100 ? '#059669' :
                                                                sprint.progress >= 70 ? '#3b82f6' :
                                                                sprint.progress >= 30 ? '#f59e0b' : '#ef4444'
                                                        }}
                                                    >
                                                        {sprint.progress || 0}%
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Start Date: {new Date(sprint.startDate).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                End Date: {new Date(sprint.endDate).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button 
                                                size="small" 
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleSprintClick(sprint)}
                                            >
                                                View Details
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );
            case 'backlogItems':
                return (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3 }}>Backlog Items</Typography>
                        {backlogItems.length === 0 ? (
                            <Alert severity="info">No backlog items found for this project</Alert>
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Effort</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {backlogItems.map((item) => (
                                            <TableRow key={item._id}>
                                                <TableCell>{item.title}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={item.type} 
                                                        size="small"
                                                        color={
                                                            item.type === 'bug' ? 'error' :
                                                            item.type === 'story' ? 'primary' : 'default'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormControl size="small">
                                                        <Select
                                                            value={item.status || STATUS.TODO}
                                                            onChange={(e) => handleBacklogItemStatusChange(item._id, e.target.value)}
                                                            sx={{
                                                                minWidth: 120,
                                                                '& .MuiSelect-select': {
                                                                    py: 1,
                                                                    bgcolor: 
                                                                        item.status === STATUS.DONE ? '#dcfce7' :
                                                                        item.status === STATUS.IN_PROGRESS ? '#dbeafe' : '#f1f5f9',
                                                                    color: 
                                                                        item.status === STATUS.DONE ? '#059669' :
                                                                        item.status === STATUS.IN_PROGRESS ? '#2563eb' : '#475569',
                                                                }
                                                            }}
                                                        >
                                                            <MenuItem value={STATUS.TODO}>To Do</MenuItem>
                                                            <MenuItem value={STATUS.IN_PROGRESS}>In Progress</MenuItem>
                                                            <MenuItem value={STATUS.DONE}>Done</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell>{item.effortEstimate}</TableCell>
                                                <TableCell>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleEditBacklogItem(item)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDeleteBacklogItem(item._id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                );
            case 'issues':
                return (
                    <Box sx={{ p: 3 }}>
                        <IssueList projectId={project.id} />
                    </Box>
                );
            default:
                return null;
        }
    };

    const handleBacklogItemStatusChange = async (itemId, newStatus) => {
        try {
            console.log('Updating item:', itemId, 'with status:', newStatus);
            const itemToUpdate = backlogItems.find(item => item._id === itemId);
            if (!itemToUpdate) {
                console.error('Item not found:', itemId);
                return;
            }

            console.log('Found item to update:', itemToUpdate);

            // Create a complete update object with all required fields
            const updatedItem = {
                title: itemToUpdate.title,
                description: itemToUpdate.description,
                type: itemToUpdate.type || 'story',
                status: newStatus,
                effortEstimate: itemToUpdate.effortEstimate || 0,
                project: itemToUpdate.project,
                sprint: itemToUpdate.sprint,
                assignedTo: itemToUpdate.assignedTo
            };

            console.log('Sending update with data:', updatedItem);
            await BacklogItemService.update(itemToUpdate._id, updatedItem);
            
            // Update local state
            setBacklogItems(prevItems =>
                prevItems.map(item =>
                    item._id === itemId ? { ...item, status: newStatus } : item
                )
            );
        } catch (error) {
            console.error('Error updating backlog item status:', error);
            setError('Failed to update status. Error: ' + error.message);
        }
    };

    const fetchBacklogItems = async () => {
        try {
            const response = await BacklogItemService.getAll();
            console.log('Raw backlog items response:', response.data);
            
            // Filter backlog items for the current project using project._id
            const projectBacklogItems = response.data.filter(item => 
                item.project === project._id
            );
            console.log('Current project:', project);
            console.log('Filtered backlog items:', projectBacklogItems);
            setBacklogItems(projectBacklogItems);
        } catch (error) {
            console.error('Error fetching backlog items:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (selectedType === 'backlogItems' && project?._id) {
            fetchBacklogItems();
        }
    }, [selectedType, project?._id]);

    const handleEditBacklogItem = (item) => {
        // Implement edit backlog item logic
    };

    const handleDeleteBacklogItem = (itemId) => {
        // Implement delete backlog item logic
    };

    const calculateSprintProgress = async (sprintId) => {
        try {
            const response = await BacklogItemService.getAll();
            // Filter backlog items for this sprint
            const sprintBacklogItems = response.data.filter(item => 
                item.sprint === sprintId
            );

            if (sprintBacklogItems.length === 0) return 0;

            // Count completed items (status === 'done')
            const completedItems = sprintBacklogItems.filter(item => 
                item.status === STATUS.DONE
            ).length;

            // Calculate percentage
            const progress = (completedItems / sprintBacklogItems.length) * 100;
            return Math.round(progress);
        } catch (error) {
            console.error('Error calculating sprint progress:', error);
            return 0;
        }
    };

    const updateSprintProgress = async () => {
        const updatedSprints = await Promise.all(
            sprints.map(async (sprint) => {
                const progress = await calculateSprintProgress(sprint._id);
                return { ...sprint, progress };
            })
        );
        setSprints(updatedSprints);
    };

    useEffect(() => {
        if (selectedType === 'sprints') {
            updateSprintProgress();
        }
    }, [selectedType]);

    // Add progress calculation when backlog items are updated
    useEffect(() => {
        if (backlogItems.length > 0) {
            updateSprintProgress();
        }
    }, [backlogItems]);

    const renderSprintsContent = () => {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>Sprints</Typography>
                <Grid container spacing={3}>
                    {sprints.map((sprint) => (
                        <Grid item xs={12} md={6} lg={4} key={sprint._id}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {sprint.name}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Progress
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={sprint.progress || 0}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: '#e2e8f0',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: 
                                                                sprint.progress === 100 ? '#059669' :
                                                                sprint.progress >= 70 ? '#3b82f6' :
                                                                sprint.progress >= 30 ? '#f59e0b' : '#ef4444',
                                                            borderRadius: 4
                                                        }
                                                    }}
                                                />
                                            </Box>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    minWidth: 40,
                                                    color: 
                                                        sprint.progress === 100 ? '#059669' :
                                                        sprint.progress >= 70 ? '#3b82f6' :
                                                        sprint.progress >= 30 ? '#f59e0b' : '#ef4444'
                                                }}
                                            >
                                                {sprint.progress || 0}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Start Date: {new Date(sprint.startDate).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        End Date: {new Date(sprint.endDate).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => handleSprintClick(sprint)}
                                    >
                                        View Details
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!project) {
        return <Box sx={{ p: 2 }}>Project not found</Box>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh', 
                backgroundColor: '#f8fafc'
            }}>
                {/* Navbar */}
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1e40af' }}>
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
                        {renderBreadcrumbs()}
                        <IconButton color="inherit">
                            <AccountCircleIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Box sx={{ display: 'flex', pt: '64px' }}>
                    {/* Sidebar */}
                    <Box
                        component="nav"
                        sx={{
                            width: 240,
                            flexShrink: 0
                        }}
                    >
                        {renderSidebar()}
                    </Box>

                    {/* Main content */}
                    <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                        <Paper sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            backgroundColor: '#fff',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}>
                            {renderContent()}
                            
                            {/* Add Epic Dialog */}
                            <AddEpic
                                open={openAddEpicDialog}
                                onClose={handleCloseAddEpicDialog}
                                projectId={id}
                                onEpicAdded={handleEpicAdded}
                            />

                            {/* Epic Details Dialog */}
                            {renderEpicDetails()}

                            {/* Edit Epic Dialog */}
                            <Dialog 
                                open={editEpicDialogOpen} 
                                onClose={handleCloseEditEpic}
                                maxWidth="sm"
                                fullWidth
                            >
                                <DialogTitle>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="h6">Edit Epic</Typography>
                                        <IconButton
                                            edge="end"
                                            color="inherit"
                                            onClick={handleCloseEditEpic}
                                            aria-label="close"
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                </DialogTitle>
                                <DialogContent>
                                    <Box sx={{ mt: 2 }}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            value={editedEpic?.name || ''}
                                            onChange={(e) => handleEditEpicChange('name', e.target.value)}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            value={editedEpic?.description || ''}
                                            onChange={(e) => handleEditEpicChange('description', e.target.value)}
                                            multiline
                                            rows={4}
                                            sx={{ mb: 2 }}
                                        />
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <Select
                                                value={editedEpic?.status || STATUS.TODO}
                                                onChange={(e) => handleEditEpicChange('status', e.target.value)}
                                                displayEmpty
                                            >
                                                <MenuItem value={STATUS.TODO}>To Do</MenuItem>
                                                <MenuItem value={STATUS.IN_PROGRESS}>In Progress</MenuItem>
                                                <MenuItem value={STATUS.DONE}>Done</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <Select
                                                value={editedEpic?.priority || 'medium'}
                                                onChange={(e) => handleEditEpicChange('priority', e.target.value)}
                                                displayEmpty
                                            >
                                                <MenuItem value="low">Low</MenuItem>
                                                <MenuItem value="medium">Medium</MenuItem>
                                                <MenuItem value="high">High</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCloseEditEpic}>Cancel</Button>
                                    <Button 
                                        onClick={handleEditEpicSave}
                                        variant="contained"
                                        sx={{ bgcolor: '#1e40af', '&:hover': { bgcolor: '#1e3a8a' } }}
                                    >
                                        Save Changes
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* Add Backlog Dialog */}
                            <Dialog open={openAddBacklogDialog} onClose={() => setOpenAddBacklogDialog(false)} maxWidth="sm" fullWidth>
                                <AddBacklog 
                                    open={openAddBacklogDialog} 
                                    onClose={() => setOpenAddBacklogDialog(false)} 
                                    onBacklogCreated={handleBacklogCreated}
                                />
                            </Dialog>

                            {/* Edit Backlog Dialog */}
                            <Dialog 
                                open={editBacklogDialogOpen} 
                                onClose={() => setEditBacklogDialogOpen(false)}
                                maxWidth="sm"
                                fullWidth
                            >
                                <DialogTitle>Edit Backlog</DialogTitle>
                                <DialogContent>
                                    <TextField
                                        label="Backlog Name"
                                        value={editedBacklogName}
                                        onChange={(e) => setEditedBacklogName(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setEditBacklogDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleEditBacklogSave} variant="contained" color="primary">
                                        Save
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </DndProvider>
    );
};

export default ProjectDetails;