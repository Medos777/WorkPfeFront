import React, { useState, useEffect } from 'react';
import {
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
    Box,
    Tooltip
} from '@mui/material';
import {
    Search,
    FilterList,
    MoreVert,
    Edit,
    Delete
} from '@mui/icons-material';
import { format } from 'date-fns';
import IssueService from '../service/IssueService';

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

const IssueList = ({ projectId }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    useEffect(() => {
        fetchIssues();
    }, [projectId]);

    const fetchIssues = async () => {
        try {
            const response = await IssueService.getAll(); // Fetches all issues
            setIssues(response.data); // Correct usage of `data`
            setLoading(false);
        } catch (error) {
            console.error('Error fetching issues:', error);
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

    const filteredIssues = issues.filter(issue =>
        issue.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.Description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper elevation={2} sx={{ mb: 2 }}>
                <Toolbar sx={{ p: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
                    </Box>
                </Toolbar>
            </Paper>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Updated</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                                ? filteredIssues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : filteredIssues
                        ).map((issue) => (
                            <TableRow
                                key={issue._id}
                                hover
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >

                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle2">{issue.Title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {issue.Description}
                                    </Typography>

                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2">{issue.project?.projectName || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={<span>{statusConfig[issue.Status]?.icon}</span>}
                                        label={issue.Status}
                                        color={statusConfig[issue.Status]?.color}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={<span>{priorityConfig[issue.Priority]?.icon}</span>}
                                        label={issue.Priority}
                                        color={priorityConfig[issue.Priority]?.color}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {format(new Date(issue.CreateDate), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(issue.UpdateDate), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, issue)}
                                    >
                                        <MoreVert />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredIssues.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>
                    <Edit sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                    <Delete sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
            >
                <MenuItem onClick={handleFilterClose}>All Issues</MenuItem>
                <MenuItem onClick={handleFilterClose}>Open Issues</MenuItem>
                <MenuItem onClick={handleFilterClose}>High Priority</MenuItem>
                <MenuItem onClick={handleFilterClose}>Recently Updated</MenuItem>
            </Menu>
        </Box>
    );
};

export default IssueList ;
