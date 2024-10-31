import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Container,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Settings as SettingsIcon,
    StarBorder as StarIcon,
    Dashboard as DashboardIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import ProjectService from "../service/ProjectService";

const drawerWidth = 240;

const ListProject = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await ProjectService.getAll();
                setProjects(response.data || []);
            } catch (error) {
                setError('Failed to fetch projects');
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleAddNewProject = () => {
        navigate('/AddProject');
    };

    const handleUpdateProject = (projectId) => {
        navigate(`/projects/update/${projectId}`);
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await ProjectService.deleteProject(projectId);
                setProjects(projects.filter(project => project._id !== projectId));
                setSelectedProject(null);
                alert("Project deleted successfully.");
            } catch (error) {
                setError('Failed to delete project');
                console.log(error);
            }
        }
    };

    const getStatusColor = (startDate, endDate) => {
        if (!startDate || !endDate) return '#757575'; // Default gray color for invalid dates

        const now = new Date();
        const end = new Date(endDate);
        const start = new Date(startDate);

        if (now > end) return '#ef4444';  // red
        if (now < start) return '#3b82f6'; // blue
        return '#22c55e'; // green
    };

    // Function to safely check if a string contains a search term
    const containsSearchTerm = (text, searchTerm) => {
        if (!text) return false;
        return text.toString().toLowerCase().includes(searchTerm.toLowerCase());
    };

    const ProjectCard = ({ project }) => (
        <Card
            sx={{
                cursor: 'pointer',
                '&:hover': { boxShadow: 3 },
                transition: 'box-shadow 0.2s'
            }}
            onClick={() => setSelectedProject(project)}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(project?.startDate, project?.endDate)
                            }}
                        />
                        <Typography variant="h6" component="div">
                            {project?.projectName || 'Untitled Project'}
                        </Typography>
                    </Box>
                    <IconButton size="small">
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    {project?.projectDescription || 'No description available'}
                </Typography>
                <Box display="flex" justifyContent="space-between" fontSize="0.875rem" color="text.secondary">
                    <Typography variant="body2">
                        Start: {project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                    </Typography>
                    <Typography variant="body2">
                        Due: {project?.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    const filteredProjects = projects.filter(project => {
        if (!project) return false;
        return (
            containsSearchTerm(project.projectName, searchTerm) ||
            containsSearchTerm(project.projectDescription, searchTerm)
        );
    });

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'white',
                    color: 'text.primary'
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <TextField
                        size="small"
                        placeholder="Search projects..."
                        variant="outlined"
                        sx={{ ml: 2, flex: 1, maxWidth: 400 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddNewProject}
                        sx={{ ml: 2 }}
                    >
                        Create Project
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="persistent"
                anchor="left"
                open={drawerOpen}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        top: '64px',
                        height: 'calc(100% - 64px)'
                    },
                }}
            >
                <List>
                    <ListItem button selected>
                        <ListItemIcon><DashboardIcon /></ListItemIcon>
                        <ListItemText primary="All Projects" />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon><TimeIcon /></ListItemIcon>
                        <ListItemText primary="Recent" />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Starred" />
                    </ListItem>
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    ml: drawerOpen ? `${drawerWidth}px` : 0,
                    transition: 'margin 0.2s',
                }}
            >
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : selectedProject ? (
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={4}>
                            <Box>
                                <Typography variant="h4" gutterBottom>
                                    {selectedProject.projectName || 'Untitled Project'}
                                </Typography>
                                <Typography color="text.secondary">
                                    {selectedProject.projectDescription || 'No description available'}
                                </Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                                <Button
                                    variant="contained"
                                    onClick={() => handleUpdateProject(selectedProject._id)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleDeleteProject(selectedProject._id)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    Back
                                </Button>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>Timeline</Typography>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography color="text.secondary">Start Date</Typography>
                                        <Typography>
                                            {selectedProject.startDate
                                                ? new Date(selectedProject.startDate).toLocaleDateString()
                                                : 'Not set'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography color="text.secondary">End Date</Typography>
                                        <Typography>
                                            {selectedProject.endDate
                                                ? new Date(selectedProject.endDate).toLocaleDateString()
                                                : 'Not set'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>

                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>Team Information</Typography>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        {/* Project Lead Information */}
                                        <Box>
                                            <Box display="flex" justifyContent="space-between" mb={1} alignItems="center">
                                                <Typography color="text.secondary">Project Lead</Typography>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    {selectedProject.projectLead ? (
                                                        <>
                                                            <Typography>
                                                                {selectedProject.projectLead.username || selectedProject.projectLead.username}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ID: {selectedProject.projectLead._id}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Typography color="warning.main">Not assigned</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                            <Divider />
                                        </Box>

                                        {/* Team Information */}
                                        <Box>
                                            <Box display="flex" justifyContent="space-between" mb={1} alignItems="center">
                                                <Typography color="text.secondary">Team</Typography>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    {selectedProject.team ? (
                                                        <>
                                                            <Typography>
                                                                {selectedProject.team.teamName || selectedProject.team.teamName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ID: {selectedProject.team._id}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <Typography color="warning.main">Not assigned</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                            <Divider />
                                        </Box>

                                        {/* Team Status */}
                                        <Box>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography color="text.secondary">Team Status</Typography>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    backgroundColor: (theme) => theme.palette.grey[100],
                                                    padding: '4px 12px',
                                                    borderRadius: '16px'
                                                }}>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            backgroundColor: getStatusColor(selectedProject?.startDate, selectedProject?.endDate)
                                                        }}
                                                    />
                                                    <Typography variant="body2">
                                                        {(() => {
                                                            const now = new Date();
                                                            const end = new Date(selectedProject?.endDate);
                                                            const start = new Date(selectedProject?.startDate);

                                                            if (now > end) return 'Completed';
                                                            if (now < start) return 'Not Started';
                                                            return 'In Progress';
                                                        })()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {selectedProject.team && selectedProject.team.members && (
                                            <Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography color="text.secondary">Team Members</Typography>
                                                    <Typography>
                                                        {selectedProject.team.members.length} members
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {filteredProjects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project?._id || Math.random()}>
                                <ProjectCard project={project} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default ListProject;