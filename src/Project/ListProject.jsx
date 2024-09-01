import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Container, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectService from "../service/ProjectService";

const ListProject = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        console.log('update project with ID:', projectId);

        navigate(`/projects/update/${projectId}`); // Navigates to the project update page
    };

    const handleDeleteProject = async (projectId) => {
        console.log('Deleting project with ID:', projectId);

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
                    Project List
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {projects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project._id}>
                                <Card>
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
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleUpdateProject(project._id)}
                                            >
                                                Update
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleDeleteProject(project._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" color="primary" onClick={handleAddNewProject}>
                        Add New Project
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default ListProject;
