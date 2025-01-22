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
    Paper,
    Divider,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import IssueService from '../service/IssueService';
import ProjectService from '../service/ProjectService';
import SprintService from '../service/SprintService';
import UserService from '../service/UserService';
import EpicService from '../service/EpicService';

const issueTypes = [
    { value: 'story', label: 'Story', color: '#36B37E' },
    { value: 'task', label: 'Task', color: '#4FADE6' },
    { value: 'bug', label: 'Bug', color: '#FF5630' },
    { value: 'epic', label: 'Epic', color: '#904EE2' }
];

const priorities = [
    { value: 'highest', label: 'Highest', color: '#FF5630' },
    { value: 'high', label: 'High', color: '#FF7452' },
    { value: 'medium', label: 'Medium', color: '#FFAB00' },
    { value: 'low', label: 'Low', color: '#36B37E' },
    { value: 'lowest', label: 'Lowest', color: '#4FADE6' }
];

const statuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'inprogress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
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
                const [projectsRes, usersRes] = await Promise.all([
                    ProjectService.getAll(),
                    UserService.getAll()
                ]);

                if (projectsRes.data && Array.isArray(projectsRes.data)) {
                    setProjects(projectsRes.data);
                } else {
                    console.error('Projects data is not an array:', projectsRes.data);
                }

                if (usersRes.data && Array.isArray(usersRes.data)) {
                    setUsers(usersRes.data);
                    // Set reporter to current user if they exist in the users list
                    const currentUserId = localStorage.getItem('userId');
                    if (currentUserId && usersRes.data.some(user => user._id === currentUserId)) {
                        setFormData(prev => ({ ...prev, reporter: currentUserId }));
                    } else if (usersRes.data.length > 0) {
                        // If current user not found, set first user as reporter
                        setFormData(prev => ({ ...prev, reporter: usersRes.data[0]._id }));
                    }
                }
            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Failed to load initial data. Please try refreshing the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch sprints and epics when project changes
    useEffect(() => {
        const fetchProjectData = async () => {
            if (!formData.project) return;

            try {
                console.log('Fetching sprints for project:', formData.project);
                const [sprintsRes, epicsRes] = await Promise.all([
                    SprintService.getByProject(formData.project),
                    EpicService.getByProject(formData.project)
                ]);

                if (sprintsRes.data) {
                    setSprints(sprintsRes.data);
                }
                if (epicsRes.data) {
                    setEpics(epicsRes.data);
                }
            } catch (err) {
                console.error('Error fetching project data:', err);
                setError('Failed to load project data');
            }
        };

        fetchProjectData();
    }, [formData.project]);

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
            // Validate required fields
            const requiredFields = ['title', 'description', 'type', 'status', 'priority', 'project', 'reporter'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
            }

            // Validate time estimates
            const maxHours = 10000; // Maximum reasonable hours (about 1 year of work)
            if (formData.originalEstimate && (Number(formData.originalEstimate) <= 0 || Number(formData.originalEstimate) > maxHours)) {
                throw new Error(`Original estimate must be between 1 and ${maxHours} hours`);
            }
            if (formData.remainingEstimate && (Number(formData.remainingEstimate) <= 0 || Number(formData.remainingEstimate) > maxHours)) {
                throw new Error(`Remaining estimate must be between 1 and ${maxHours} hours`);
            }
            if (formData.timeSpent && (Number(formData.timeSpent) <= 0 || Number(formData.timeSpent) > maxHours)) {
                throw new Error(`Time spent must be between 1 and ${maxHours} hours`);
            }

            // Validate story points
            if (formData.storyPoints && (Number(formData.storyPoints) <= 0 || Number(formData.storyPoints) > 100)) {
                throw new Error('Story points must be between 1 and 100');
            }

            // Convert numeric fields and clean up the payload
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                type: formData.type.toLowerCase(),
                status: formData.status === 'todo' ? 'todo' : formData.status === 'in progress' ? 'inprogress' : 'done',
                priority: formData.priority.toLowerCase(),
                project: formData.project,
                reporter: formData.reporter,
                assignee: formData.assignee || undefined,
                sprint: formData.sprint || undefined,
                epic: formData.epic || undefined,
                storyPoints: formData.storyPoints ? Number(formData.storyPoints) : undefined,
                originalEstimate: formData.originalEstimate ? Number(formData.originalEstimate) : undefined,
                remainingEstimate: formData.remainingEstimate ? Number(formData.remainingEstimate) : undefined,
                timeSpent: formData.timeSpent ? Number(formData.timeSpent) : undefined,
                dueDate: formData.dueDate || undefined,
                labels: [],
                components: [],
                watchers: []
            };

            // Remove any undefined values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });

            console.log('Submitting issue with payload:', payload);
            const response = await IssueService.create(payload);
            
            if (!response || !response.data) {
                throw new Error('No response received from server');
            }

            console.log('Issue created successfully:', response.data);
            setSuccess('Issue created successfully!');
            setTimeout(() => {
                navigate(projectId ? `/projects/${projectId}/issues` : '/issues');
            }, 2000);
        } catch (err) {
            console.error('Error creating issue:', err);
            let errorMessage = 'Failed to create issue';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.details) {
                errorMessage = Array.isArray(err.response.data.details) 
                    ? err.response.data.details.join(', ')
                    : err.response.data.details;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !projects.length && !users.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container component="main" maxWidth="md">
            <CssBaseline />
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" gutterBottom>
                        Create New Issue
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="title"
                                    label="Issue Title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    error={!formData.title}
                                    helperText={!formData.title && "Title is required"}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    multiline
                                    rows={4}
                                    name="description"
                                    label="Description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    error={!formData.description}
                                    helperText={!formData.description && "Description is required"}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!formData.project}>
                                    <InputLabel>Project</InputLabel>
                                    <Select
                                        name="project"
                                        value={formData.project}
                                        onChange={handleChange}
                                        disabled={!!projectId}
                                    >
                                        {projects.map((project) => (
                                            <MenuItem key={project._id} value={project._id}>
                                                {project.projectName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!formData.type}>
                                    <InputLabel>Issue Type</InputLabel>
                                    <Select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                    >
                                        {issueTypes.map((type) => (
                                            <MenuItem 
                                                key={type.value} 
                                                value={type.value}
                                                sx={{
                                                    '&::before': {
                                                        content: '""',
                                                        display: 'inline-block',
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        backgroundColor: type.color,
                                                        marginRight: 1
                                                    }
                                                }}
                                            >
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!formData.status}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {statuses.map((status) => (
                                            <MenuItem key={status.value} value={status.value}>
                                                {status.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!formData.priority}>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                    >
                                        {priorities.map((priority) => (
                                            <MenuItem 
                                                key={priority.value} 
                                                value={priority.value}
                                                sx={{
                                                    '&::before': {
                                                        content: '""',
                                                        display: 'inline-block',
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        backgroundColor: priority.color,
                                                        marginRight: 1
                                                    }
                                                }}
                                            >
                                                {priority.label}
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
                                        {sprints.map((sprint) => (
                                            <MenuItem key={sprint._id} value={sprint._id}>
                                                {sprint.name}
                                            </MenuItem>
                                        ))}
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
                                        disabled={formData.type === 'epic'}
                                    >
                                        <MenuItem value="">None</MenuItem>
                                        {epics.map((epic) => (
                                            <MenuItem key={epic._id} value={epic._id}>
                                                {epic.title}
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
                                            <MenuItem key={user._id} value={user._id}>
                                                {user.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!formData.reporter}>
                                    <InputLabel>Reporter</InputLabel>
                                    <Select
                                        name="reporter"
                                        value={formData.reporter}
                                        onChange={handleChange}
                                    >
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <MenuItem key={user._id} value={user._id}>
                                                    {user.name || user.username}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="">No users available</MenuItem>
                                        )}
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
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="originalEstimate"
                                    label="Original Estimate (hours)"
                                    value={formData.originalEstimate}
                                    onChange={handleChange}
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="dueDate"
                                    label="Due Date"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(-1)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{ minWidth: 120 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Create Issue'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default AddIssue;
