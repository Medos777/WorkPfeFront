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

    // Get user role and ID from localStorage
    const userRole = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    // Function to get user by ID
    const getUserById = (userId) => {
        return users.find(user => user._id === userId);
    };

    // Function to apply filters
    const applyFilters = (issues) => {
        // Si l'utilisateur est un développeur, filtrer uniquement ses issues
        let filteredByRole = issues;
        if (userRole === 'developer') {
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

        // Stocker les résultats filtrés dans le localStorage
        const filteredIssuesData = {
            timestamp: new Date().toISOString(),
            userRole,
            userId,
            issues: filtered
        };
        localStorage.setItem('filteredIssues', JSON.stringify(filteredIssuesData));

        return filtered;
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
                
                // Appliquer les filtres aux nouvelles données
                const filtered = applyFilters(allIssuesRes.data);
                console.log('Filtered Issues:', filtered);
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

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Issues
                </Typography>
                {userRole === 'manager' && (
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
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

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
                                            <Chip
                                                size="small"
                                                label={issue.status || 'No Status'}
                                                color={issue.status?.toLowerCase() === 'done' ? 'success' : 'default'}
                                            />
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
                                            <IconButton
                                                size="small"
                                                onClick={(event) => {
                                                    setAnchorEl(event.currentTarget);
                                                    setSelectedIssue(issue);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
