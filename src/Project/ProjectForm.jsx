import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, CssBaseline, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

function ProjectForm({ isEdit, projectData, onSubmit }) {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { projectId } = useParams();

    useEffect(() => {
        if (isEdit && projectData) {
            setProjectName(projectData.ProjectName);
            setDescription(projectData.description);
            setStartDate(projectData.StartDate);
            setEndDate(projectData.EndDate);
        }
    }, [isEdit, projectData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const updatedProjectData = { ProjectName: projectName, description, StartDate: startDate, EndDate: endDate };
        try {
            if (isEdit) {
                await onSubmit(projectId, updatedProjectData);
            } else {
                await onSubmit(updatedProjectData);
            }
            navigate('/project'); // Navigate to the project list or another page after submission
        } catch (error) {
            console.error("Failed to submit project", error);
            // Optionally, show an error message to the user
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    {isEdit ? 'Update Scrum Project' : 'Create New Scrum Project'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="ProjectName"
                        label="Project Name"
                        name="ProjectName"
                        autoComplete="ProjectName"
                        autoFocus
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="description"
                        label="Description"
                        name="description"
                        autoComplete="description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="StartDate"
                        label="Start Date"
                        name="StartDate"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="EndDate"
                        label="End Date"
                        name="EndDate"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update Project' : 'Create Project')}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default ProjectForm;
