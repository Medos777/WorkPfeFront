import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    CircularProgress,
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    InputAdornment,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Divider,
    Alert,
} from '@mui/material';
import {
    Add,
    Search,
    Star,
    StarBorder,
    MoreVert,
    ArrowUpward,
    ArrowDownward,
    CalendarToday,
    Group,
    Description,
    Flag,
    Edit,
    Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import projectService from '../service/ProjectService';

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ['All Statuses', 'Upcoming', 'Ongoing', 'Completed'];

const getStatusColor = (status) => {
    switch (status) {
        case 'Upcoming':
            return '#0052CC';
        case 'Ongoing':
            return '#00875A';
        case 'Completed':
            return '#6B778C';
        default:
            return '#6B778C';
    }
};

const ProjectRow = ({ project, onFavorite, onProjectClick }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <TableRow
            hover
            onClick={() => onProjectClick(project)}
            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F4F5F7' } }}
        >
            <TableCell padding="checkbox">
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite(project._id);
                    }}
                >
                    {project.favorite ? (
                        <Star sx={{ color: '#F4C145' }} />
                    ) : (
                        <StarBorder sx={{ color: '#6B778C' }} />
                    )}
                </IconButton>
            </TableCell>
            <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            backgroundColor: '#DFE1E6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {(project.projectName || '').charAt(0).toUpperCase()}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ color: '#172B4D' }}>
                            {project.projectName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B778C' }}>
                            {project.key || project._id}
                        </Typography>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell>
                <Chip
                    label={project.status}
                    size="small"
                    sx={{
                        backgroundColor: `${getStatusColor(project.status)}15`,
                        color: getStatusColor(project.status),
                        fontWeight: 600,
                    }}
                />
            </TableCell>
            <TableCell>
                <Typography variant="body2" sx={{ color: '#6B778C' }}>
                    {formatDate(project.startDate)}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2" sx={{ color: '#6B778C' }}>
                    {formatDate(project.endDate)}
                </Typography>
            </TableCell>
            <TableCell align="right">
                <IconButton size="small">
                    <MoreVert sx={{ color: '#6B778C' }} />
                </IconButton>
            </TableCell>
        </TableRow>
    );
};

const ProjectDetailsDialog = ({ project, open, onClose, onViewProject, onEdit, onDelete }) => {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleDelete = () => {
        setDeleteConfirmOpen(false);
        onDelete(project._id);
        onClose();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (!project) return null;

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                    }
                }}
            >
                <DialogTitle>
                    <Stack 
                        direction="row" 
                        spacing={2} 
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    backgroundColor: '#DFE1E6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                }}
                            >
                                {(project.projectName || '').charAt(0).toUpperCase()}
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ color: '#172B4D' }}>
                                    {project.projectName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                    Project Key: {project.key || project._id}
                                </Typography>
                            </Box>
                        </Stack>
                        <Box>
                            <Tooltip title="Edit Project">
                                <IconButton
                                    onClick={() => {
                                        onClose();
                                        onEdit(project._id);
                                    }}
                                    sx={{ color: '#6B778C' }}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Project">
                                <IconButton
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    sx={{ color: '#6B778C' }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Stack>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Description sx={{ color: '#6B778C' }} />
                                <Typography variant="subtitle1" sx={{ color: '#172B4D' }}>
                                    Description
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#172B4D', ml: 4 }}>
                                {project.description || 'No description provided'}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Flag sx={{ color: '#6B778C' }} />
                                <Typography variant="subtitle1" sx={{ color: '#172B4D' }}>
                                    Status
                                </Typography>
                            </Stack>
                            <Box sx={{ ml: 4 }}>
                                <Chip
                                    label={project.status}
                                    size="small"
                                    sx={{
                                        backgroundColor: `${getStatusColor(project.status)}15`,
                                        color: getStatusColor(project.status),
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <CalendarToday sx={{ color: '#6B778C' }} />
                                <Typography variant="subtitle1" sx={{ color: '#172B4D' }}>
                                    Timeline
                                </Typography>
                            </Stack>
                            <Box sx={{ ml: 4 }}>
                                <Typography variant="body2" sx={{ color: '#172B4D' }}>
                                    Start Date: {formatDate(project.startDate)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#172B4D' }}>
                                    End Date: {formatDate(project.endDate)}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Group sx={{ color: '#6B778C' }} />
                                <Typography variant="subtitle1" sx={{ color: '#172B4D' }}>
                                    Team
                                </Typography>
                            </Stack>
                            <Box sx={{ ml: 4 }}>
                                <Typography variant="body2" sx={{ color: '#172B4D' }}>
                                    Team Members: {project.teamMembers?.length || 0}
                                </Typography>
                                {project.teamMembers?.map((member, index) => (
                                    <Typography key={index} variant="body2" sx={{ color: '#6B778C' }}>
                                        • {member.name || member}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} sx={{ color: '#6B778C' }}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            onClose();
                            onViewProject(project._id);
                        }}
                        sx={{
                            backgroundColor: '#0052CC',
                            '&:hover': { backgroundColor: '#0747A6' },
                        }}
                    >
                        View Project
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Delete Project</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete project "{project.projectName}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const ListProject = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [error, setError] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getAll();
            setProjects(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load projects. Please try again later.');
            console.error('Error loading projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async (projectId) => {
        const updatedProjects = projects.map((p) =>
            p._id === projectId ? { ...p, favorite: !p.favorite } : p
        );
        setProjects(updatedProjects);
        // TODO: Implement backend favorite functionality
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredProjects = projects
        .filter((project) => {
            const matchesSearch = project.projectName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === 'All Statuses' || project.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (!sortField) return 0;
            const factor = sortDirection === 'asc' ? 1 : -1;
            if (sortField === 'name') {
                return factor * (a.projectName || '').localeCompare(b.projectName || '');
            }
            if (sortField === 'startDate') {
                return (
                    factor *
                    (new Date(a.startDate).getTime() -
                        new Date(b.startDate).getTime())
                );
            }
            if (sortField === 'endDate') {
                return (
                    factor *
                    (new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                );
            }
            return 0;
        });

    const renderSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? (
            <ArrowUpward sx={{ fontSize: 16 }} />
        ) : (
            <ArrowDownward sx={{ fontSize: 16 }} />
        );
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        setDialogOpen(true);
    };

    const handleDelete = async (projectId) => {
        try {
            await projectService.deleteProject(projectId);
            setProjects(projects.filter(p => p._id !== projectId));
            setSuccessMessage('Project deleted successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to delete project. Please try again.');
            console.error('Error deleting project:', err);
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="60vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#172B4D' }}>
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/projects/add')}
                    sx={{
                        backgroundColor: '#0052CC',
                        '&:hover': { backgroundColor: '#0747A6' },
                    }}
                >
                    Create project
                </Button>
            </Box>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#6B778C' }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Select
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ width: 200 }}
                >
                    {STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            {error && (
                <Box sx={{ mb: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell
                                onClick={() => handleSort('name')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Name {renderSortIcon('name')}
                                </Box>
                            </TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell
                                onClick={() => handleSort('startDate')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Start Date {renderSortIcon('startDate')}
                                </Box>
                            </TableCell>
                            <TableCell
                                onClick={() => handleSort('endDate')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    End Date {renderSortIcon('endDate')}
                                </Box>
                            </TableCell>
                            <TableCell align="right" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProjects.map((project) => (
                            <ProjectRow
                                key={project._id}
                                project={project}
                                onFavorite={handleFavorite}
                                onProjectClick={() => handleProjectClick(project)}
                            />
                        ))}
                        {filteredProjects.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Box sx={{ py: 3 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: '#6B778C' }}
                                        >
                                            No projects found
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ProjectDetailsDialog
                project={selectedProject}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedProject(null);
                }}
                onViewProject={(id) => navigate(`/projects/${id}`)}
                onEdit={(id) => navigate(`/projects/update/${id}`)}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default ListProject;
