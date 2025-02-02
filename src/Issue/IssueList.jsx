import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Button,
    TextField,
    MenuItem,
    Menu,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Avatar,
    Tooltip,
    TablePagination,
    Grid,
    CircularProgress,
    ListItemIcon
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterIcon,
    MoreVert,
    Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import IssueService from '../service/IssueService';
import ProjectService from '../service/ProjectService';
import UserService from '../service/UserService';
import { useNavigate, useParams } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { alpha } from '@mui/material/styles';

const priorityConfig = {
    highest: { color: 'error', icon: '⚡', label: 'Highest' },
    high: { color: 'warning', icon: '↑', label: 'High' },
    medium: { color: 'info', icon: '→', label: 'Medium' },
    low: { color: 'success', icon: '↓', label: 'Low' },
    lowest: { color: 'default', icon: '↓↓', label: 'Lowest' }
};

const typeConfig = {
    story: { color: 'primary', icon: <Assignment />, label: 'Story' },
    task: { color: 'info', icon: <Assignment />, label: 'Task' },
    bug: { color: 'error', icon: <Assignment />, label: 'Bug' },
    epic: { color: 'secondary', icon: <Assignment />, label: 'Epic' }
};

const ITEMS_PER_PAGE = 10;

const STATUS_TYPES = {
    TODO: 'todo',
    IN_PROGRESS: 'inprogress',
    DONE: 'done'
};

const DISPLAY_STATUS = {
    [STATUS_TYPES.TODO]: 'To Do',
    [STATUS_TYPES.IN_PROGRESS]: 'In Progress',
    [STATUS_TYPES.DONE]: 'Done'
};

const statusColors = {
    [STATUS_TYPES.TODO]: '#e5e7eb',
    [STATUS_TYPES.IN_PROGRESS]: '#fef3c7',
    [STATUS_TYPES.DONE]: '#d1fae5'
};

const statusIcons = {
    [STATUS_TYPES.TODO]: '📋',
    [STATUS_TYPES.IN_PROGRESS]: '🔄',
    [STATUS_TYPES.DONE]: '✅'
};

const avatarColors = ['#1976d2', '#dc004e', '#388e3c', '#f57c00', '#6d1b7b'];

const getAvatarColor = (username) => {
    const index = username.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
};

// Function to generate consistent colors from strings
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const IssueList = () => {
    const { projectId } = useParams();
    const [allIssues, setAllIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState(projectId || 'all');
    const [epicFilter, setEpicFilter] = useState('all');
    const [projects, setProjects] = useState([]);
    const [epics, setEpics] = useState([]);
    const [users, setUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('table');

    // Get user role and ID from localStorage
    const userRole = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const isDeveloper = userRole === 'developer';

    // Function to get user by ID
    const getUserById = (userId) => {
        return users.find(user => user._id === userId);
    };

    // Function to apply filters
    const applyFilters = (issues) => {
        // Si l'utilisateur est un développeur, filtrer uniquement ses issues
        let filteredByRole = issues;
        if (isDeveloper) {
            filteredByRole = issues.filter(issue => issue.assignee === userId);
        }

        const filtered = filteredByRole.filter(issue => {
            const matchesProject = projectFilter === 'all' || issue.projectId === projectFilter;
            const matchesEpic = epicFilter === 'all' || issue.epicId === epicFilter;
            const matchesType = typeFilter === 'all' || issue.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
            const matchesSearch = !searchTerm || 
                issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesProject && matchesEpic && matchesType && matchesStatus && matchesSearch;
        });

        return filtered;
    };

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const currentIssue = allIssues.find(issue => issue._id === issueId);
            if (!currentIssue) return;

            // Store in cookies
            document.cookie = `issue_status_${issueId}=${newStatus}; max-age=604800; path=/`; // 7 days expiry

            // Update UI
            setAllIssues(prevIssues => 
                prevIssues.map(issue => 
                    issue._id === issueId 
                        ? { ...issue, status: newStatus }
                        : issue
                )
            );

            // Update backend
            const updateData = {
                title: currentIssue.title,
                description: currentIssue.description,
                status: newStatus,
                priority: currentIssue.priority,
                projectId: currentIssue.projectId,
                epicId: currentIssue.epicId,
                assignee: currentIssue.assignee,
                reporter: currentIssue.reporter,
                owner: localStorage.getItem('userId'),
                storyPoints: currentIssue.storyPoints,
                dueDate: currentIssue.dueDate
            };

            await IssueService.update(issueId, updateData);
            console.log('Status updated successfully in backend and stored in cookies');
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projectsRes, allIssuesRes, usersRes] = await Promise.all([
                    ProjectService.getAll(),
                    IssueService.getAll(),
                    UserService.getAll()
                ]);
                
                console.log('Fetched Issues:', allIssuesRes.data);
                console.log('Fetched Users:', usersRes.data);
                
                setUsers(usersRes.data);
                setProjects(projectsRes.data);
                setAllIssues(allIssuesRes.data);
                
                // Set epics from all issues
                const epicsFromIssues = allIssuesRes.data.filter(issue => issue.type === 'epic');
                setEpics(epicsFromIssues);
                
                // Apply initial filters
                const filtered = applyFilters(allIssuesRes.data);
                setFilteredIssues(filtered);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        // Toujours charger les données fraîches au montage du composant
        fetchData();
    }, []); // Dépendances vides pour ne s'exécuter qu'au montage

    // Mettre à jour les filtres quand ils changent
    useEffect(() => {
        if (allIssues.length > 0) {  // Seulement si nous avons des issues
            const filtered = applyFilters(allIssues);
            setFilteredIssues(filtered);
        }
    }, [projectFilter, epicFilter, typeFilter, statusFilter, searchTerm, allIssues]);

    const handleProjectChange = (event) => {
        setProjectFilter(event.target.value);
        setEpicFilter('all');
    };

    const handleEpicChange = (event) => {
        setEpicFilter(event.target.value);
        setProjectFilter('all');
    };

    const toggleViewMode = () => {
        setViewMode(prevMode => (prevMode === 'table' ? 'card' : 'table'));
    };

    const CardView = ({ issue }) => {
        const [{ isDragging }, drag] = useDrag({
            type: 'issue',
            item: { 
                id: issue._id,
                currentStatus: issue.status 
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        const assignee = users.find(user => user._id === issue.assignee);

        return (
            <Box
                ref={drag}
                sx={{
                    opacity: isDragging ? 0.4 : 1,
                    cursor: 'move',
                    bgcolor: 'background.paper',
                    p: 2,
                    m: 1,
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)'
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {issue.key}
                    </Typography>
                    <Chip
                        size="small"
                        label={issue.priority}
                        color={priorityConfig[issue.priority.toLowerCase()]?.color || 'default'}
                        sx={{ height: 24 }}
                    />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                    {issue.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    {assignee ? (
                        <Tooltip title={assignee.username}>
                            <Avatar
                                sx={{ 
                                    width: 24, 
                                    height: 24,
                                    bgcolor: getAvatarColor(assignee.username),
                                    fontSize: '0.875rem'
                                }}
                            >
                                {assignee.username.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                    ) : (
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.300' }}>-</Avatar>
                    )}
                    {issue.storyPoints && (
                        <Chip
                            size="small"
                            label={`${issue.storyPoints} pts`}
                            variant="outlined"
                            sx={{ height: 24 }}
                        />
                    )}
                </Box>
            </Box>
        );
    };

    const StatusColumn = ({ status, issues }) => {
        const [{ isOver }, drop] = useDrop({
            accept: 'issue',
            drop: (item) => {
                if (item.currentStatus !== status) {
                    handleStatusChange(item.id, status);
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver()
            })
        });

        return (
            <Box
                ref={drop}
                sx={{
                    width: '33%',
                    minHeight: 500,
                    p: 2,
                    bgcolor: isOver ? alpha(statusColors[status], 0.7) : statusColors[status],
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 2,
                    px: 2,
                    py: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <Typography variant="h6" sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'text.primary',
                        fontWeight: 'medium'
                    }}>
                        {statusIcons[status]} {DISPLAY_STATUS[status]}
                    </Typography>
                    <Chip
                        size="small"
                        label={issues.length}
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 'auto' }}
                    />
                </Box>
                <Box sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    minHeight: 400,
                    p: 1,
                    overflowY: 'auto'
                }}>
                    {issues.map((issue) => (
                        <CardView key={issue._id} issue={issue} />
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Issues
                </Typography>
                {!isDeveloper && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate(projectId ? `/projects/${projectId}/issues/add` : '/issues/add')}
                    >
                        Add Issue
                    </Button>
                )}
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1 }} />
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={projectFilter}
                            onChange={handleProjectChange}
                            label="Project"
                        >
                            <MenuItem value="all">All Projects</MenuItem>
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                        <InputLabel>Epic</InputLabel>
                        <Select
                            value={epicFilter}
                            onChange={handleEpicChange}
                            label="Epic"
                            disabled={projectFilter === 'all'}
                        >
                            <MenuItem value="all">All Epics</MenuItem>
                            {epics.map((epic) => (
                                <MenuItem key={epic._id} value={epic._id}>
                                    {epic.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            label="Type"
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            {Object.entries(typeConfig).map(([type, config]) => (
                                <MenuItem key={type} value={type}>
                                    {config.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value={STATUS_TYPES.TODO}>{DISPLAY_STATUS[STATUS_TYPES.TODO]}</MenuItem>
                            <MenuItem value={STATUS_TYPES.IN_PROGRESS}>{DISPLAY_STATUS[STATUS_TYPES.IN_PROGRESS]}</MenuItem>
                            <MenuItem value={STATUS_TYPES.DONE}>{DISPLAY_STATUS[STATUS_TYPES.DONE]}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button variant="contained" onClick={toggleViewMode}>
                Toggle to {viewMode === 'table' ? 'Card' : 'Table'} View
            </Button>

            {viewMode === 'table' ? (
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell>Key</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Assignee</TableCell>
                                <TableCell>Reporter</TableCell>
                                <TableCell>Story Points</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={12} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredIssues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} align="center">
                                        <Typography variant="body1" color="textSecondary">
                                            No issues found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredIssues
                                    .slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
                                    .map((issue) => (
                                        <TableRow
                                            hover
                                            key={issue._id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell>{issue.key || 'N/A'}</TableCell>
                                            <TableCell>
                                                {issue.type && typeConfig[issue.type] ? (
                                                    <Tooltip title={typeConfig[issue.type].label}>
                                                        <IconButton size="small" color={typeConfig[issue.type].color}>
                                                            {typeConfig[issue.type].icon}
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <IconButton size="small" disabled>
                                                        <Assignment />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                            <TableCell>{issue.title || 'Untitled'}</TableCell>
                                            <TableCell>
                                                {issue.priority && priorityConfig[issue.priority] ? (
                                                    <Chip
                                                        size="small"
                                                        label={priorityConfig[issue.priority].label}
                                                        color={priorityConfig[issue.priority].color}
                                                        icon={<span>{priorityConfig[issue.priority].icon}</span>}
                                                    />
                                                ) : (
                                                    <Chip
                                                        size="small"
                                                        label="None"
                                                        color="default"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={issue.status}
                                                    onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                                >
                                                    <MenuItem value={STATUS_TYPES.TODO}>{DISPLAY_STATUS[STATUS_TYPES.TODO]}</MenuItem>
                                                    <MenuItem value={STATUS_TYPES.IN_PROGRESS}>{DISPLAY_STATUS[STATUS_TYPES.IN_PROGRESS]}</MenuItem>
                                                    <MenuItem value={STATUS_TYPES.DONE}>{DISPLAY_STATUS[STATUS_TYPES.DONE]}</MenuItem>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {issue.assignee ? (
                                                    <Tooltip title={(getUserById(issue.assignee)?.email) || 'Unknown'}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {console.log('Assignee ID:', issue.assignee)}
                                                            {console.log('Assignee User:', getUserById(issue.assignee))}
                                                            <Avatar
                                                                sx={{ width: 24, height: 24, mr: 1 }}
                                                                alt={(getUserById(issue.assignee)?.email) || 'Unknown'}
                                                            >
                                                                {(getUserById(issue.assignee)?.email?.charAt(0)) || '?'}
                                                            </Avatar>
                                                            <Typography variant="body2">
                                                                {(getUserById(issue.assignee)?.email) || 'Unknown'}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="Unassigned">
                                                        <Avatar sx={{ width: 24, height: 24 }}>?</Avatar>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {issue.reporter ? (
                                                    <Tooltip title={(getUserById(issue.reporter)?.email) || 'Unknown'}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {console.log('Reporter ID:', issue.reporter)}
                                                            {console.log('Reporter User:', getUserById(issue.reporter))}
                                                            <Avatar
                                                                sx={{ width: 24, height: 24, mr: 1 }}
                                                                alt={(getUserById(issue.reporter)?.email) || 'Unknown'}
                                                            >
                                                                {(getUserById(issue.reporter)?.email?.charAt(0)) || '?'}
                                                            </Avatar>
                                                            <Typography variant="body2">
                                                                {(getUserById(issue.reporter)?.email) || 'Unknown'}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip title="No Reporter">
                                                        <Avatar sx={{ width: 24, height: 24 }}>?</Avatar>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell>{issue.storyPoints || '-'}</TableCell>
                                            <TableCell>
                                                {issue.dueDate ? format(new Date(issue.dueDate), 'MMM d, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {issue.createdAt ? format(new Date(issue.createdAt), 'MMM d, yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {!isDeveloper && (
                                                    <IconButton
                                                        onClick={(event) => {
                                                            setAnchorEl(event.currentTarget);
                                                            setSelectedIssue(issue);
                                                        }}
                                                        size="small"
                                                    >
                                                        <MoreVert />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <DndProvider backend={HTML5Backend}>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 3,
                        mt: 3,
                        px: 2,
                        minHeight: 'calc(100vh - 200px)',
                        bgcolor: '#f3f4f6',
                        borderRadius: 2,
                        p: 3
                    }}>
                        <StatusColumn
                            status={STATUS_TYPES.TODO}
                            issues={filteredIssues.filter(issue => issue.status === STATUS_TYPES.TODO)}
                        />
                        <StatusColumn
                            status={STATUS_TYPES.IN_PROGRESS}
                            issues={filteredIssues.filter(issue => issue.status === STATUS_TYPES.IN_PROGRESS)}
                        />
                        <StatusColumn
                            status={STATUS_TYPES.DONE}
                            issues={filteredIssues.filter(issue => issue.status === STATUS_TYPES.DONE)}
                        />
                    </Box>
                </DndProvider>
            )}

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredIssues.length}
                rowsPerPage={ITEMS_PER_PAGE}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                    setSelectedIssue(null);
                }}
            >
                <MenuItem onClick={() => {
                    navigate(`/issues/edit/${selectedIssue?._id}`);
                    setAnchorEl(null);
                    setSelectedIssue(null);
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this issue?')) {
                        try {
                            await IssueService.remove(selectedIssue?._id);
                            const fetchData = async () => {
                                setLoading(true);
                                try {
                                    const [projectsRes, allIssuesRes, usersRes] = await Promise.all([
                                        ProjectService.getAll(),
                                        IssueService.getAll(),
                                        UserService.getAll()
                                    ]);
                                    
                                    setUsers(usersRes.data);
                                    setProjects(projectsRes.data);
                                    setAllIssues(allIssuesRes.data);
                                    
                                    // Set epics from all issues
                                    const epicsFromIssues = allIssuesRes.data.filter(issue => issue.type === 'epic');
                                    setEpics(epicsFromIssues);
                                    
                                    // Apply initial filters
                                    const filtered = applyFilters(allIssuesRes.data);
                                    setFilteredIssues(filtered);
                                } catch (error) {
                                    console.error('Error fetching data:', error);
                                } finally {
                                    setLoading(false);
                                }
                            };
                            fetchData();
                        } catch (error) {
                            console.error('Error deleting issue:', error);
                        }
                    }
                    setAnchorEl(null);
                    setSelectedIssue(null);
                }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default IssueList;
