import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Tooltip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import epicService from '../service/EpicService';
import AddEpic from './AddEpic';

const EpicList = () => {
    const { projectId } = useParams();
    const [epics, setEpics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openAddDialog, setOpenAddDialog] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    useEffect(() => {
        loadEpics();
    }, []);

    const loadEpics = async () => {
        try {
            setLoading(true);
            const response = await epicService.getAll();
            const filteredEpics = projectId 
                ? response.data.filter(epic => epic.project === projectId)
                : response.data;
            setEpics(filteredEpics);
        } catch (err) {
            setError('Failed to load epics. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEpic = () => {
        setOpenAddDialog(true);
    };

    const handleCloseDialog = (refresh = false) => {
        setOpenAddDialog(false);
        if (refresh) {
            loadEpics();
        }
    };

    const getStatusColor = (status) => {
        const normalizedStatus = status?.toLowerCase();
        switch (normalizedStatus) {
            case 'to do':
                return { bg: '#E5E8EC', color: '#42526E' };
            case 'in progress':
                return { bg: '#DEEBFF', color: '#0747A6' };
            case 'done':
                return { bg: '#E3FCEF', color: '#006644' };
            default:
                return { bg: '#F4F5F7', color: '#42526E' };
        }
    };

    const getPriorityColor = (priority) => {
        const normalizedPriority = priority?.toLowerCase();
        switch (normalizedPriority) {
            case 'highest':
                return '#CD1317';
            case 'high':
                return '#DE350B';
            case 'medium':
                return '#FF991F';
            case 'low':
                return '#2D8738';
            case 'lowest':
                return '#00875A';
            default:
                return '#42526E';
        }
    };

    const filteredEpics = epics.filter(epic => {
        const matchesSearch = epic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            epic.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            epic.key.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || epic.status.toLowerCase() === statusFilter;
        const matchesPriority = priorityFilter === 'all' || epic.priority.toLowerCase() === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#172B4D' }}>
                    Epics
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddEpic}
                    sx={{
                        backgroundColor: '#0052CC',
                        '&:hover': { backgroundColor: '#0747A6' },
                    }}
                >
                    Create Epic
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    placeholder="Search epics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="to do">To Do</MenuItem>
                        <MenuItem value="in progress">In Progress</MenuItem>
                        <MenuItem value="done">Done</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        label="Priority"
                    >
                        <MenuItem value="all">All Priorities</MenuItem>
                        <MenuItem value="highest">Highest</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="lowest">Lowest</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Key</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEpics.map((epic) => (
                            <TableRow key={epic._id}>
                                <TableCell>{epic.key}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {epic.name}
                                    </Typography>
                                    {epic.description && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {epic.description}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={epic.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: getStatusColor(epic.status).bg,
                                            color: getStatusColor(epic.status).color,
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={epic.priority}
                                        size="small"
                                        sx={{
                                            color: getPriorityColor(epic.priority),
                                            backgroundColor: 'transparent',
                                            border: `1px solid ${getPriorityColor(epic.priority)}`,
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {epic.startDate && new Date(epic.startDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {epic.dueDate && new Date(epic.dueDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {epic.progress ? `${(epic.progress.completed / epic.progress.total * 100).toFixed(0)}%` : '0%'}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit Epic">
                                        <IconButton size="small" onClick={() => {/* TODO: Implement edit */}}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Epic">
                                        <IconButton size="small" onClick={() => {/* TODO: Implement delete */}}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredEpics.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No epics found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddEpic
                open={openAddDialog}
                onClose={handleCloseDialog}
                projectId={projectId}
            />
        </Box>
    );
};

export default EpicList;