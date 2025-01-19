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
import SprintService from '../service/SprintService';
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
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState(projectId || 'all');
    const [epicFilter, setEpicFilter] = useState('all');
    const [sprintFilter, setSprintFilter] = useState('all');
    const [projects, setProjects] = useState([]);
    const [epics, setEpics] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projectsRes, sprintsRes] = await Promise.all([
                    ProjectService.getAll(),
                    SprintService.getAll()
                ]);
                setProjects(projectsRes.data);
                setSprints(sprintsRes.data);
                
                // Fetch epics for the selected project
                if (projectFilter !== 'all') {
                    const epicsRes = await IssueService.getByProject(projectFilter);
                    setEpics(epicsRes.data.filter(issue => issue.type === 'epic'));
                }

                // Fetch issues based on filters
                let issuesData;
                if (projectFilter !== 'all') {
                    issuesData = await IssueService.getByProject(projectFilter);
                } else if (epicFilter !== 'all') {
                    issuesData = await IssueService.getByEpic(epicFilter);
                } else if (sprintFilter !== 'all') {
                    issuesData = await IssueService.getBySprint(sprintFilter);
                } else {
                    issuesData = await IssueService.getAll();
                }
                setIssues(issuesData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectFilter, epicFilter, sprintFilter]);

    const handleProjectChange = (event) => {
        setProjectFilter(event.target.value);
        setEpicFilter('all'); // Reset epic filter when project changes
        setSprintFilter('all'); // Reset sprint filter when project changes
    };

    const handleEpicChange = (event) => {
        setEpicFilter(event.target.value);
        setProjectFilter('all'); // Reset project filter when epic is selected
        setSprintFilter('all'); // Reset sprint filter when epic is selected
    };

    const handleSprintChange = (event) => {
        setSprintFilter(event.target.value);
        setProjectFilter('all'); // Reset project filter when sprint is selected
        setEpicFilter('all'); // Reset epic filter when sprint is selected
    };

    const filteredIssues = issues.filter((issue) => {
        const matchesSearch = (issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.key?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
        const matchesStatus = statusFilter === 'all' || 
            (issue.status && issue.status.toLowerCase() === statusFilter.toLowerCase());
        const matchesType = typeFilter === 'all' || 
            (issue.type && issue.type.toLowerCase() === typeFilter.toLowerCase());
        return matchesSearch && matchesStatus && matchesType;
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Issues
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(projectId ? `/projects/${projectId}/issues/add` : '/issues/add')}
                >
                    Add Issue
                </Button>
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
                        <InputLabel>Sprint</InputLabel>
                        <Select
                            value={sprintFilter}
                            onChange={handleSprintChange}
                            label="Sprint"
                        >
                            <MenuItem value="all">All Sprints</MenuItem>
                            {sprints
                                .filter(sprint => projectFilter === 'all' || sprint.project === projectFilter)
                                .map((sprint) => (
                                    <MenuItem key={sprint._id} value={sprint._id}>
                                        {sprint.name}
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
                            <TableCell>Sprint</TableCell>
                            <TableCell>Story Points</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredIssues.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((issue) => (
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
                                        <Tooltip title={issue.assignee.name || 'Unknown'}>
                                            <Avatar
                                                sx={{ width: 24, height: 24 }}
                                                alt={issue.assignee.name}
                                                src={issue.assignee.avatar}
                                            >
                                                {issue.assignee.name ? issue.assignee.name.charAt(0) : '?'}
                                            </Avatar>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Unassigned">
                                            <Avatar sx={{ width: 24, height: 24 }}>?</Avatar>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {issue.reporter ? (
                                        <Tooltip title={issue.reporter.name || 'Unknown'}>
                                            <Avatar
                                                sx={{ width: 24, height: 24 }}
                                                alt={issue.reporter.name}
                                                src={issue.reporter.avatar}
                                            >
                                                {issue.reporter.name ? issue.reporter.name.charAt(0) : '?'}
                                            </Avatar>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="No Reporter">
                                            <Avatar sx={{ width: 24, height: 24 }}>?</Avatar>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {issue.sprint ? (
                                        <Chip
                                            size="small"
                                            label={issue.sprint.name}
                                            color="info"
                                        />
                                    ) : (
                                        <Chip
                                            size="small"
                                            label="Backlog"
                                            variant="outlined"
                                        />
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
                        ))}
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
                                    let issuesData;
                                    if (projectFilter !== 'all') {
                                        issuesData = await IssueService.getByProject(projectFilter);
                                    } else if (epicFilter !== 'all') {
                                        issuesData = await IssueService.getByEpic(epicFilter);
                                    } else if (sprintFilter !== 'all') {
                                        issuesData = await IssueService.getBySprint(sprintFilter);
                                    } else {
                                        issuesData = await IssueService.getAll();
                                    }
                                    setIssues(issuesData.data);
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
