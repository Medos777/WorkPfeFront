import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    CircularProgress,
    Switch,
    LinearProgress,
    Pagination,
    Alert,
    Modal,
    Tooltip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { saveAs } from 'file-saver';
import projectService from '../service/ProjectService';

const ITEMS_PER_PAGE = 6;
const STATUS_OPTIONS = ['All Statuses', 'Upcoming', 'Ongoing', 'Completed'];
const SORT_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'startDateAsc', label: 'Start Date (Asc)' },
    { value: 'startDateDesc', label: 'Start Date (Desc)' },
    { value: 'progressAsc', label: 'Progress (Asc)' },
    { value: 'progressDesc', label: 'Progress (Desc)' },
];

const ProjectCard = ({ project, provided, isDragging, onClick }) => {
    const getProgress = () => {
        const start = new Date(project.startDate).getTime();
        const end = new Date(project.endDate).getTime();
        const today = Date.now();
        return Math.min(100, Math.max(0, ((today - start) / (end - start)) * 100));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            sx={{
                margin: 1,
                transition: 'all 0.3s ease',
                transform: isDragging ? 'rotate(3deg) scale(1.02)' : 'none',
                '&:hover': { boxShadow: 6 },
            }}
            onClick={onClick}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {project.projectName}
                </Typography>
                <Typography color="text.secondary">
                    Start: {formatDate(project.startDate)}
                </Typography>
                <Typography color="text.secondary">
                    End: {formatDate(project.endDate)}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={getProgress()}
                    sx={{ mt: 2 }}
                />
            </CardContent>
        </Card>
    );
};

const ListProject = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [sortOption, setSortOption] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);

    const navigate = useNavigate();

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getAll();
            setProjects(response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const getProgress = (project) => {
        const start = new Date(project.startDate).getTime();
        const end = new Date(project.endDate).getTime();
        const today = Date.now();
        return Math.min(100, Math.max(0, ((today - start) / (end - start)) * 100));
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(projects);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setProjects(items);

        try {
            console.log('Reordered projects:', items);
        } catch (err) {
            console.error('Error updating project order:', err);
        }
    };

    const handleExport = () => {
        const headers = 'Project Name,Start Date,End Date\n';
        const csv = headers + projects.map((p) => {
            const startDate = p.startDate && !isNaN(new Date(p.startDate)) ? new Date(p.startDate).toISOString() : 'N/A';
            const endDate = p.endDate && !isNaN(new Date(p.endDate)) ? new Date(p.endDate).toISOString() : 'N/A';
            return `${p.projectName || 'Unnamed Project'},${startDate},${endDate}`;
        }).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'projects.csv');
    };


    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.projectName?.toLowerCase().includes(searchQuery.toLowerCase());

        if (statusFilter === 'All Statuses') return matchesSearch;

        const today = new Date();
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);

        const status =
            today < startDate ? 'Upcoming' :
                today > endDate ? 'Completed' : 'Ongoing';

        return matchesSearch && status === statusFilter;
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        switch (sortOption) {
            case 'startDateAsc':
                return new Date(a.startDate) - new Date(b.startDate);
            case 'startDateDesc':
                return new Date(b.startDate) - new Date(a.startDate);
            case 'progressAsc':
                return getProgress(a) - getProgress(b);
            case 'progressDesc':
                return getProgress(b) - getProgress(a);
            default:
                return 0;
        }
    });

    const paginatedProjects = sortedProjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const renderModal = () => (
        <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                {selectedProject && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            {selectedProject.projectName}
                        </Typography>
                        <Typography>
                            {selectedProject.description || 'No description available.'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(`/projects/update/${selectedProject._id}`)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => setOpenModal(false)}
                            >
                                Close
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4">Project Management</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Tooltip title="Export projects as CSV">
                            <Button onClick={handleExport} variant="outlined">
                                Export CSV
                            </Button>
                        </Tooltip>
                        <Tooltip title="Toggle light/dark mode">
                            <Switch
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                            />
                        </Tooltip>
                        <Tooltip title="Create a new project">
                            <Button
                                startIcon={<Add />}
                                variant="contained"
                                onClick={() => navigate('/projects/add')}
                            >
                                New Project
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Filters */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        label="Search Projects"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <Select
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
                    <Select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        sx={{ width: 200 }}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Projects */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="projects">
                        {(provided) => (
                            <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: 2,
                                    minHeight: 400,
                                }}
                            >
                                {paginatedProjects.map((project, index) => (
                                    <Draggable
                                        key={project._id}
                                        draggableId={String(project._id)}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <ProjectCard
                                                project={project}
                                                provided={provided}
                                                isDragging={snapshot.isDragging}
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setOpenModal(true);
                                                }}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* Pagination */}
                {paginatedProjects.length > 0 && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={Math.ceil(sortedProjects.length / ITEMS_PER_PAGE)}
                            page={currentPage}
                            onChange={(_, page) => setCurrentPage(page)}
                        />
                    </Box>
                )}

                {renderModal()}
            </Box>
        </ThemeProvider>
    );
};

export default ListProject;
