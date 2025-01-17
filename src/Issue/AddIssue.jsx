import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    CssBaseline,
    CircularProgress,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Alert,
    Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IssueService from '../service/IssueService';
import ProjectService from '../service/ProjectService';
import SprintService from '../service/SprintService';

const AddIssue = () => {
    const [formData, setFormData] = useState({
        Title: '',
        Description: '',
        Status: 'Open',
        Priority: 'Medium',
        project: '',
        sprint: '',
    });
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [filteredSprints, setFilteredSprints] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projectsResponse, sprintsResponse] = await Promise.all([
                    ProjectService.getAll(),
                    SprintService.getAll(),
                ]);
                setProjects(projectsResponse.data);
                setSprints(sprintsResponse.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setError('Failed to load necessary data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === 'project') {
            setFormData((prevData) => ({
                ...prevData,
                sprint: '',
            }));
            setFilteredSprints(sprints.filter((sprint) => sprint.project === value));
        }
    };

    const validateForm = () => {
        if (!formData.Title.trim()) return 'Title is required';
        if (!formData.Description.trim()) return 'Description is required';
        if (!formData.Status) return 'Status is required';
        if (!formData.Priority) return 'Priority is required';
        if (!formData.project) return 'Project is required';
        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                CreateDate: new Date().toISOString(),
                UpdateDate: new Date().toISOString(),
            };
            const response = await IssueService.create(payload);
            setSuccess('Issue created successfully!');
            setTimeout(() => navigate('/issues'), 2000);
        } catch (error) {
            console.error('Failed to submit issue', error);
            let errorMessage = 'Failed to submit issue. Please try again.';
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                errorMessage =
                    'No response received from server. Please check your connection.';
            } else {
                errorMessage = error.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container component="main" maxWidth="md">
            <CssBaseline />
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    Create New Issue
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="Title"
                        label="Title"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="Description"
                        label="Description"
                        name="Description"
                        multiline
                        rows={4}
                        value={formData.Description}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="Status"
                            name="Status"
                            value={formData.Status}
                            label="Status"
                            onChange={handleChange}
                        >
                            <MenuItem value="Open">Open</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Select
                            labelId="priority-label"
                            id="Priority"
                            name="Priority"
                            value={formData.Priority}
                            label="Priority"
                            onChange={handleChange}
                        >
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="Low">Low</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="project-label">Project</InputLabel>
                        <Select
                            labelId="project-label"
                            id="project"
                            name="project"
                            value={formData.project}
                            label="Project"
                            onChange={handleChange}
                        >
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                    {project.projectName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="sprint-label">Sprint</InputLabel>
                        <Select
                            labelId="sprint-label"
                            id="sprint"
                            name="sprint"
                            value={formData.sprint}
                            label="Sprint"
                            onChange={handleChange}
                            disabled={!formData.project}
                        >
                            <MenuItem value="">None</MenuItem>
                            {filteredSprints.map((sprint) => (
                                <MenuItem key={sprint._id} value={sprint._id}>
                                    {sprint.sprintName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </Box>
            </Box>
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
                <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AddIssue;
