import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    TextField,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    Tooltip,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
} from '@mui/material';
import {
    Search,
    FilterList,
    MoreVert,
    Edit,
    Delete,
    Add as AddIcon,
    AssignmentInd,
    Label,
    CalendarMonth,
} from '@mui/icons-material';
import { format } from 'date-fns';
import IssueService from '../service/IssueService';
import { useNavigate } from 'react-router-dom';

const priorityConfig = {
    High: { color: 'error', icon: '🔴' },
    Medium: { color: 'warning', icon: '🟡' },
    Low: { color: 'success', icon: '🟢' }
};

const statusConfig = {
    Open: { color: 'info', icon: '📝' },
    'In Progress': { color: 'warning', icon: '⚡' },
    Resolved: { color: 'success', icon: '✅' },
    Closed: { color: 'default', icon: '🔒' }
};

const ITEMS_PER_PAGE = 10;
const FILTER_OPTIONS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const IssueList = ({ projectId }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');

    const navigate = useNavigate();

    useEffect(() => {
        fetchIssues();
    }, [projectId]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await IssueService.getAll();
            setIssues(response.data || []);
        } catch (error) {
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleMenuOpen = (event, issue) => {
        setAnchorEl(event.currentTarget);
        setSelectedIssue(issue);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedIssue(null);
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleEdit = () => {
        navigate(`/issues/edit/${selectedIssue._id}`);
        handleMenuClose();
    };

    const handleDelete = async () => {
        try {
            await IssueService.deleteIssues(selectedIssue._id);
            fetchIssues();
        } catch (err) {
            console.error('Error deleting issue:', err);
        }
        handleMenuClose();
    };

    const filteredIssues = issues.filter(issue =>
        issue.Title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'All' || issue.Status === statusFilter)
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper elevation={2} sx={{ mb: 2 }}>
                <Toolbar sx={{ p: 2 }}>
                    <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                        Issues
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search issues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />
                        <Tooltip title="Filter list">
                            <IconButton onClick={handleFilterClick}>
                                <FilterList />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Create a new issue">
                            <IconButton color="primary" onClick={() => navigate('/issues/add')}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </Paper>

            <Grid container spacing={3}>
                {(rowsPerPage > 0
                        ? filteredIssues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : filteredIssues
                ).map((issue) => (
                    <Grid item xs={12} sm={6} md={4} key={issue._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {issue.Title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    {issue.Description}
                                </Typography>
                                <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={1}>
                                    <Chip
                                        icon={<span>{statusConfig[issue.Status]?.icon}</span>}
                                        label={issue.Status}
                                        color={statusConfig[issue.Status]?.color}
                                        size="small"
                                    />
                                    <Chip
                                        icon={<span>{priorityConfig[issue.Priority]?.icon}</span>}
                                        label={issue.Priority}
                                        color={priorityConfig[issue.Priority]?.color}
                                        size="small"
                                    />
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <CalendarMonth fontSize="small" color="action" />
                                    <Typography variant="body2" color="textSecondary">
                                        Created: {format(new Date(issue.CreateDate), 'MMM dd, yyyy')}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <CalendarMonth fontSize="small" color="action" />
                                    <Typography variant="body2" color="textSecondary">
                                        Updated: {format(new Date(issue.UpdateDate), 'MMM dd, yyyy')}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <AssignmentInd fontSize="small" color="action" />
                                    <Typography variant="body2" color="textSecondary">
                                        Project: {issue.project?.projectName || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Label fontSize="small" color="action" />
                                    <Typography variant="body2" color="textSecondary">
                                        Sprint: {issue.sprint?.sprintName || 'N/A'}
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions>
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, issue)}
                                >
                                    <MoreVert />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredIssues.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <Delete fontSize="small" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
            >
                {FILTER_OPTIONS.map((option) => (
                    <MenuItem key={option} onClick={() => {
                        setStatusFilter(option);
                        handleFilterClose();
                    }}>
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default IssueList;
