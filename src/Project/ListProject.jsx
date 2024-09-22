import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Container, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectService from "../service/ProjectService";

const ListProject = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null); // To track the selected project
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await ProjectService.getAll();
                setProjects(response.data);
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
        navigate('/AddProject'); // Navigates to the project creation page
    };

    const handleUpdateProject = (projectId) => {
        navigate(`/projects/update/${projectId}`); // Navigates to the project update page
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await ProjectService.deleteProject(projectId); // Call the corrected delete method
                // Refresh the project list after deletion
                setProjects(projects.filter(project => project.id !== projectId));
                alert("Project deleted successfully.");
            } catch (error) {
                setError('Failed to delete project');
                console.log(error);
            }
        }
    };

    const handleSelectProject = (project) => {
        setSelectedProject(project); // Set the selected project
    };

    const handleBackToList = () => {
        setSelectedProject(null); // Reset the selected project to go back to the list
    };

    return (
        <Container component="main" maxWidth="md">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    {selectedProject ? "Project Details" : "Project List"}
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : selectedProject ? (
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{selectedProject.ProjectName}</Typography>
                            <Typography color="textSecondary">
                                Start Date: {selectedProject.StartDate}
                            </Typography>
                            <Typography color="textSecondary">
                                End Date: {selectedProject.EndDate}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                {selectedProject.description}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 4 }}>Issues:</Typography>
                            {selectedProject.issues && selectedProject.issues.length > 0 ? (
                                <ul>
                                    {selectedProject.issues.map((issue, index) => (
                                        <li key={index}>
                                            <Typography variant="body1">{issue}</Typography>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No issues found.
                                </Typography>
                                )}
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleUpdateProject(selectedProject._id)}
                                >
                                    Update
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
                                    color="secondary"
                                    onClick={handleBackToList}
                                >
                                    Back to List
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    // Show project list when no project is selected
                    <Grid container spacing={3}>
                        {projects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project._id}>
                                <Card onClick={() => handleSelectProject(project)}>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {project.ProjectName}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            {project.StartDate} - {project.EndDate}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 2 }}>
                                            {project.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                {!selectedProject && (
                    <Box sx={{ mt: 3 }}>
                        <Button variant="contained" color="primary" onClick={handleAddNewProject}>
                            Add New Project
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default ListProject;
