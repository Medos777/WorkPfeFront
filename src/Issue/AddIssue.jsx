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
        reporter: '',
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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch all data in parallel
                const [projectsRes, usersRes] = await Promise.all([
                    ProjectService.getAll(),
                    UserService.getAll()
                ]);

                setProjects(projectsRes.data || []);
                setUsers(usersRes.data || []);

                // If we have a project ID, fetch related data
                if (formData.project) {
                    const [sprintsRes, epicsRes] = await Promise.all([
                        SprintService.getByProject(formData.project),
                        IssueService.getByProject(formData.project)
                    ]);

                    setSprints(sprintsRes.data || []);
                    
                    // Filter epics from issues
                    const projectEpics = epicsRes.data?.filter(issue => 
                        issue.type === 'epic'
                    ) || [];
                    setEpics(projectEpics);
                } else {
                    setSprints([]);
                    setEpics([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [formData.project]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await IssueService.create(formData);
            setSuccess('Issue created successfully!');
            setTimeout(() => {
                navigate(projectId ? `/projects/${projectId}/issues` : '/issues');
            }, 2000);
        } catch (error) {
            console.error('Error creating issue:', error);
            setError(error.response?.data?.message || 'Failed to create issue');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'project') {
            setFormData(prev => ({
                ...prev,
                sprint: '',
                epic: ''
            }));
        }
    };

    const handleLabelsChange = (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            labels: newValue
        }));
    };

    const handleComponentsChange = (event, newValue) => {
        setFormData(prev => ({
            ...prev,
            components: newValue
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) return 'Title is required';
        if (!formData.description.trim()) return 'Description is required';
        if (!formData.type) return 'Type is required';
        if (!formData.priority) return 'Priority is required';
        if (!formData.project) return 'Project is required';
        if (!formData.reporter) return 'Reporter is required';
        return null;
    };

    if (loading) {
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
                <Typography component="h1" variant="h4" gutterBottom>
                    Create New Issue
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    label="Type"
                                >
                                    {issueTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    label="Priority"
                                >
                                    {priorities.map((priority) => (
                                        <MenuItem key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Project</InputLabel>
                                <Select
                                    name="project"
                                    value={formData.project}
                                    onChange={handleChange}
                                    label="Project"
                                    required
                                >
                                    {projects.map((project) => (
                                        <MenuItem key={project._id} value={project._id}>
                                            {project.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Sprint</InputLabel>
                                <Select
                                    name="sprint"
                                    value={formData.sprint}
                                    onChange={handleChange}
                                    label="Sprint"
                                    disabled={!formData.project}
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
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Epic</InputLabel>
                                <Select
                                    name="epic"
                                    value={formData.epic}
                                    onChange={handleChange}
                                    label="Epic"
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
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Assignee</InputLabel>
                                <Select
                                    name="assignee"
                                    value={formData.assignee}
                                    onChange={handleChange}
                                    label="Assignee"
                                >
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar
                                                    src={user.avatar}
                                                    sx={{ width: 24, height: 24 }}
                                                >
                                                    {user.name ? user.name.charAt(0) : '?'}
                                                </Avatar>
                                                {user.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Reporter</InputLabel>
                                <Select
                                    name="reporter"
                                    value={formData.reporter}
                                    onChange={handleChange}
                                    label="Reporter"
                                    required
                                >
                                    {users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar
                                                    src={user.avatar}
                                                    sx={{ width: 24, height: 24 }}
                                                >
                                                    {user.name ? user.name.charAt(0) : '?'}
                                                </Avatar>
                                                {user.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Story Points"
                                name="storyPoints"
                                value={formData.storyPoints}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Original Estimate (hours)"
                                name="originalEstimate"
                                value={formData.originalEstimate}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Remaining Estimate (hours)"
                                name="remainingEstimate"
                                value={formData.remainingEstimate}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Time Spent (hours)"
                                name="timeSpent"
                                value={formData.timeSpent}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={formData.labels}
                                onChange={handleLabelsChange}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Labels"
                                        placeholder="Add labels"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={formData.components}
                                onChange={handleComponentsChange}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Components"
                                        placeholder="Add components"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={formData.watchers}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        watchers: newValue
                                    }));
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                            color="info"
                                            variant="outlined"
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Watchers"
                                        placeholder="Add watchers"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Due Date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/issues')}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Create Issue'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>
            <Snackbar
                open={!!error || !!success}
                autoHideDuration={6000}
                onClose={() => {
                    setError('');
                    setSuccess('');
                }}
            >
                <Alert
                    severity={error ? 'error' : 'success'}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {error || success}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AddIssue;
