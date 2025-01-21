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
    Grid,
    Chip,
    Avatar,
    Autocomplete,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import IssueService from '../service/IssueService';
import ProjectService from '../service/ProjectService';
import SprintService from '../service/SprintService';
import UserService from '../service/UserService';
import EpicService from '../service/EpicService';

const issueTypes = [
    { value: 'story', label: 'Story' },
    { value: 'task', label: 'Task' },
    { value: 'bug', label: 'Bug' },
    { value: 'epic', label: 'Epic' }
];

const priorities = [
    { value: 'highest', label: 'Highest' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'lowest', label: 'Lowest' }
];

const AddIssue = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'task',
        status: 'todo',
        priority: 'medium',
        project: projectId || '',
        sprint: '',
        epic: '',
        assignee: '',
        reporter: localStorage.getItem('userId') || '',
        storyPoints: '',
        originalEstimate: '',
        remainingEstimate: '',
        timeSpent: '',
        labels: [],
        components: [],
        watchers: [],
        dueDate: ''
    });

    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [epics, setEpics] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const projectsRes = await ProjectService.getAll();
                const usersRes = await UserService.getAll();

                console.log('Raw Projects Response:', projectsRes);
                console.log('Projects Data Structure:', projectsRes.data);
                
                if (projectsRes.data && Array.isArray(projectsRes.data)) {
                    setProjects(projectsRes.data);
                    console.log('Set Projects State:', projectsRes.data);
                } else {
                    console.error('Projects data is not an array:', projectsRes.data);
                }

                setUsers(usersRes.data || []);
            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch project-specific data when project changes
    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);
                const [sprintsRes, epicsRes] = await Promise.all([
                    SprintService.getAll(),
                    EpicService.getAll()
                ]);

                console.log('All Sprints:', sprintsRes.data);
                console.log('All Epics:', epicsRes.data);

                setSprints(sprintsRes.data || []);
                setEpics(epicsRes.data || []);
            } catch (err) {
                console.error('Error fetching project data:', err);
                setError('Failed to load project data');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear dependent fields when project changes
        if (name === 'project') {
            setFormData(prev => ({
                ...prev,
                sprint: '',
                epic: ''
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await IssueService.create(formData);
            setSuccess('Issue created successfully!');
            setTimeout(() => {
                navigate(projectId ? `/projects/${projectId}/issues` : '/issues');
            }, 2000);
        } catch (err) {
            console.error('Error creating issue:', err);
            setError(err.response?.data?.message || 'Failed to create issue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="md">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Create New Issue
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="title"
                                label="Title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                name="description"
                                label="Description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Project</InputLabel>
                                <Select
                                    name="project"
                                    value={formData.project}
                                    onChange={handleChange}
                                    required
                                    disabled={!!projectId}
                                >
                                    {projects.map((project) => {
                                        console.log('Rendering project:', project);
                                        return (
                                            <MenuItem key={project._id} value={project._id}>
                                                {project.projectName || project.name || 'Unnamed Project'}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    {issueTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Sprint</InputLabel>
                                <Select
                                    name="sprint"
                                    value={formData.sprint}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {sprints.map((sprint) => {
                                        console.log('Rendering sprint:', sprint);
                                        return (
                                            <MenuItem key={sprint._id} value={sprint._id}>
                                                {sprint.sprintName || sprint.name || 'Unnamed Sprint'}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Epic</InputLabel>
                                <Select
                                    name="epic"
                                    value={formData.epic}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {epics.map((epic) => {
                                        console.log('Rendering epic:', epic);
                                        return (
                                            <MenuItem key={epic._id} value={epic._id}>
                                                {epic.epicName || epic.name || epic.title || 'Unnamed Epic'}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    required
                                >
                                    {priorities.map((priority) => (
                                        <MenuItem key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Assignee</InputLabel>
                                <Select
                                    name="assignee"
                                    value={formData.assignee}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.username}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Reporter</InputLabel>
                                <Select
                                    name="reporter"
                                    value={formData.reporter}
                                    onChange={handleChange}
                                    required
                                >
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.username}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                name="storyPoints"
                                label="Story Points"
                                value={formData.storyPoints}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    fullWidth
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Create Issue'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Container>
    );
};

export default AddIssue;
