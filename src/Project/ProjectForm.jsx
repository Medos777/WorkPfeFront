import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    CssBaseline,
    CircularProgress,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Alert,
    Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TeamService from '../service/TeamService';
import UserService from '../service/UserService';
import ProjectService from '../service/ProjectService';

function ProjectForm({ isEdit = false, projectData = null }) {
    const [formData, setFormData] = useState({
        projectName: '',
        projectDescription: '',
        startDate: '',
        endDate: '',
        projectLead: '',
        team: ''
    });
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [initialLoad, setInitialLoad] = useState(true);
    const navigate = useNavigate();
    const { projectId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch teams and users
                const [teamsResponse, usersResponse] = await Promise.all([
                    TeamService.getAll(),
                    UserService.getAll()
                ]);
                setTeams(teamsResponse.data);
                setUsers(usersResponse.data);

                // If editing, fetch project details
                if (isEdit && projectId && initialLoad) {
                    const projectResponse = await ProjectService.getById(projectId);
                    const project = projectResponse.data;

                    setFormData({
                        projectName: project.projectName || '',
                        projectDescription: project.projectDescription || '',
                        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                        // Set the actual IDs instead of nested objects
                        projectLead: project.projectLead?._id || project.projectLead || '',
                        team: project.team?._id || project.team || ''
                    });
                    setInitialLoad(false);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                setError('Failed to load necessary data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, isEdit, initialLoad]);

    // Handle project data passed as prop
    useEffect(() => {
        if (isEdit && projectData && initialLoad) {
            setFormData({
                projectName: projectData.projectName || '',
                projectDescription: projectData.projectDescription || '',
                startDate: projectData.startDate ? new Date(projectData.startDate).toISOString().split('T')[0] : '',
                endDate: projectData.endDate ? new Date(projectData.endDate).toISOString().split('T')[0] : '',
                // Set the actual IDs instead of nested objects
                projectLead: projectData.projectLead?._id || projectData.projectLead || '',
                team: projectData.team?._id || projectData.team || ''
            });
            setInitialLoad(false);
        }
    }, [isEdit, projectData, initialLoad]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.projectName.trim()) return "Project Name is required";
        if (!formData.projectDescription.trim()) return "Project Description is required";
        if (!formData.startDate) return "Start Date is required";
        if (!formData.endDate) return "End Date is required";
        if (new Date(formData.endDate) <= new Date(formData.startDate)) return "End Date must be after Start Date";
        if (!formData.projectLead) return "Project Lead is required";
        if (!formData.team) return "Team selection is required";
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
            let response;
            // Send the raw form data with IDs
            if (isEdit) {
                response = await ProjectService.update(projectId, formData);
            } else {
                response = await ProjectService.create(formData);
            }
            setSuccess(isEdit ? 'Project updated successfully!' : 'Project created successfully!');
            setTimeout(() => navigate('/projects'), 2000);
        } catch (error) {
            console.error("Failed to submit project", error);
            let errorMessage = 'Failed to submit project. Please try again.';
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                errorMessage = "No response received from server. Please check your connection.";
            } else {
                errorMessage = error.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getUserName = (userId) => {
        const user = users.find(u => u._id === userId);
        return user ? `${user.name} (ID: ${userId})` : userId;
    };

    const getTeamName = (teamId) => {
        const team = teams.find(t => t._id === teamId);
        return team ? `${team.name} (ID: ${teamId})` : teamId;
    };

    if (loading && !initialLoad) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    {isEdit ? 'Update Scrum Project' : 'Create New Scrum Project'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="projectName"
                        label="Project Name"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="projectDescription"
                        label="Description"
                        name="projectDescription"
                        multiline
                        rows={4}
                        value={formData.projectDescription}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="startDate"
                        label="Start Date"
                        name="startDate"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="endDate"
                        label="End Date"
                        name="endDate"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="projectLead-label">Project Lead</InputLabel>
                        <Select
                            labelId="projectLead-label"
                            id="projectLead"
                            name="projectLead"
                            value={formData.projectLead}
                            label="Project Lead"
                            onChange={handleChange}
                            required
                        >
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    {`${user.username} (ID: ${user._id})`}
                                </MenuItem>
                            ))}
                        </Select>
                        {formData.projectLead && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Selected Project Lead: {getUserName(formData.projectLead)}
                            </Typography>
                        )}
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="team-label">Select Team</InputLabel>
                        <Select
                            labelId="team-label"
                            id="team"
                            name="team"
                            value={formData.team}
                            label="Select Team"
                            onChange={handleChange}
                            required
                        >
                            {teams.map((team) => (
                                <MenuItem key={team._id} value={team._id}>
                                    {`${team.teamName} (ID: ${team._id})`}
                                </MenuItem>
                            ))}
                        </Select>
                        {formData.team && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                Selected Team: {getTeamName(formData.team)}
                            </Typography>
                        )}
                    </FormControl>
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
}

export default ProjectForm;