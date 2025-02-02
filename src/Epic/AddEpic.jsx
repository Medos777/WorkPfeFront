import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    useTheme,
    useMediaQuery,
    Box,
    Alert,
    CircularProgress,
    Chip,
    Typography,
    FormHelperText
} from '@mui/material';
import epicService from '../service/EpicService';
import projectService from '../service/ProjectService';
import issueService from '../service/IssueService';

const AddEpic = ({ open, onClose, projectId: initialProjectId, epic }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [projects, setProjects] = useState([]);
    const [issues, setIssues] = useState([]);
    const [epicData, setEpicData] = useState({
        name: '',
        description: '',
        project: initialProjectId || '',
        status: 'to do',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        color: '#0052CC',
        labels: [],
        watchers: [],
        issues: []
    });

    // Load projects and issues
    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsResponse, issuesResponse] = await Promise.all([
                    projectService.getAll(),
                    issueService.getAll()
                ]);
                setProjects(projectsResponse.data);
                setIssues(issuesResponse.data);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load required data');
            }
        };
        loadData();
    }, []);

    // Set epic data when editing
    useEffect(() => {
        if (epic) {
            setEpicData({
                name: epic.name || '',
                description: epic.description || '',
                project: epic.project || initialProjectId || '',
                status: epic.status || 'to do',
                priority: epic.priority || 'medium',
                startDate: epic.startDate ? new Date(epic.startDate).toISOString().split('T')[0] : '',
                dueDate: epic.dueDate ? new Date(epic.dueDate).toISOString().split('T')[0] : '',
                color: epic.color || '#0052CC',
                labels: epic.labels || [],
                watchers: epic.watchers || [],
                issues: epic.issues || []
            });
        } else {
            setEpicData({
                name: '',
                description: '',
                project: initialProjectId || '',
                status: 'to do',
                priority: 'medium',
                startDate: '',
                dueDate: '',
                color: '#0052CC',
                labels: [],
                watchers: [],
                issues: []
            });
        }
    }, [epic, initialProjectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('Handle change:', name, value);

        if (name === 'issues') {
            console.log('Issues selected:', value);
            setEpicData(prev => {
                const newData = {
                    ...prev,
                    issues: Array.isArray(value) ? value : []
                };
                console.log('New epic data after issues change:', newData);
                return newData;
            });
        } else {
            const newValue = name === 'project' ? (value || '') : (value === '' ? undefined : value);
            setEpicData(prev => ({
                ...prev,
                [name]: newValue
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Get userId from localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        // Validate required fields
        if (!epicData.name?.trim()) {
            setError('Epic name is required');
            setLoading(false);
            return;
        }

        try {
            // Prepare data for submission
            const data = {
                name: epicData.name.trim(),
                description: epicData.description?.trim(),
                status: epicData.status?.toLowerCase() || 'to do',
                priority: epicData.priority?.toLowerCase() || 'medium',
                owner: userId,
                project: epicData.project || initialProjectId || null,
                startDate: epicData.startDate || undefined,
                dueDate: epicData.dueDate || undefined,
                color: epicData.color || '#0052CC',
                labels: epicData.labels?.length > 0 ? epicData.labels : undefined,
                watchers: epicData.watchers?.length > 0 ? epicData.watchers : undefined,
                issues: epicData.issues?.length > 0 ? epicData.issues : undefined
            };

            // Remove undefined values
            Object.keys(data).forEach(key => {
                if (data[key] === undefined) {
                    delete data[key];
                }
            });

            console.log('Submitting epic data:', data);

            let response;
            if (epic) {
                response = await epicService.update(epic._id, data);
                console.log('Epic updated:', response.data);
                setSuccess('Epic updated successfully!');
            } else {
                response = await epicService.create(data);
                console.log('Epic created:', response.data);
                setSuccess('Epic created successfully!');
            }

            // Only update issues if we have them and we're creating a new epic
            if (!epic && response.data?._id && epicData.issues?.length > 0) {
                try {
                    await Promise.all(epicData.issues.map(issueId =>
                        issueService.update(issueId, { epic: response.data._id })
                    ));
                    console.log('Issues updated successfully');
                } catch (issueError) {
                    console.error('Error updating issues:', issueError);
                    // Don't fail the whole operation if issue update fails
                }
            }

            setTimeout(() => {
                setLoading(false);
                onClose(true);
            }, 1000);
        } catch (err) {
            console.error('Error submitting epic:', err);
            const errorMessage = err.response?.data?.message || 'Failed to save epic. Please check all required fields.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEpicData({
            name: '',
            description: '',
            project: initialProjectId || '',
            status: 'to do',
            priority: 'medium',
            startDate: '',
            dueDate: '',
            color: '#0052CC',
            labels: [],
            watchers: [],
            issues: []
        });
        setError('');
        setSuccess('');
        onClose(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'to do':
                return { bg: '#E3F2FD', color: '#1976D2' };
            case 'in progress':
                return { bg: '#F7DC6F', color: '#FFD700' };
            case 'done':
                return { bg: '#C6F4D6', color: '#2E865F' };
            default:
                return { bg: '#E3F2FD', color: '#1976D2' };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'highest':
                return '#FF0000';
            case 'high':
                return '#FFA07A';
            case 'medium':
                return '#FFFF00';
            case 'low':
                return '#32CD32';
            case 'lowest':
                return '#008000';
            default:
                return '#FFFF00';
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            fullScreen={isMobile}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{epic ? 'Edit Epic' : 'Create New Epic'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
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
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="key"
                                label="Epic Key (Optional)"
                                value={epicData.key}
                                onChange={handleChange}
                                fullWidth
                                size={isMobile ? "small" : "medium"}
                                helperText="Unique identifier for project-linked epics"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="name"
                                label="Epic Name"
                                value={epicData.name}
                                onChange={handleChange}
                                fullWidth
                                required
                                size={isMobile ? "small" : "medium"}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
                                value={epicData.description}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                                size={isMobile ? "small" : "medium"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                <InputLabel>Project (Optional)</InputLabel>
                                <Select
                                    name="project"
                                    value={epicData.project || ''}
                                    onChange={handleChange}
                                    label="Project (Optional)"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {projects.map((project) => (
                                        <MenuItem key={project._id} value={project._id}>
                                            {project.projectName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={epicData.status}
                                    onChange={handleChange}
                                    label="Status"
                                >
                                    <MenuItem value="to do">To Do</MenuItem>
                                    <MenuItem value="in progress">In Progress</MenuItem>
                                    <MenuItem value="done">Done</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    name="priority"
                                    value={epicData.priority}
                                    onChange={handleChange}
                                    label="Priority"
                                >
                                    <MenuItem value="highest">Highest</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="lowest">Lowest</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="color"
                                label="Epic Color"
                                type="color"
                                value={epicData.color}
                                onChange={handleChange}
                                fullWidth
                                size={isMobile ? "small" : "medium"}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="startDate"
                                label="Start Date"
                                type="date"
                                value={epicData.startDate}
                                onChange={handleChange}
                                fullWidth
                                size={isMobile ? "small" : "medium"}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="dueDate"
                                label="Due Date"
                                type="date"
                                value={epicData.dueDate}
                                onChange={handleChange}
                                fullWidth
                                size={isMobile ? "small" : "medium"}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                                <InputLabel id="issues-label">Issues</InputLabel>
                                <Select
                                    labelId="issues-label"
                                    name="issues"
                                    multiple
                                    value={epicData.issues || []}
                                    onChange={handleChange}
                                    label="Issues"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const issue = issues.find(i => i._id === value);
                                                return (
                                                    <Chip
                                                        key={value}
                                                        label={issue ? `${issue.key} - ${issue.title}` : value}
                                                        sx={{
                                                            backgroundColor: issue ? getStatusColor(issue.status).bg : '#E3F2FD',
                                                            color: issue ? getStatusColor(issue.status).color : '#1976D2',
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300
                                            }
                                        }
                                    }}
                                >
                                    {issues && issues.length > 0 ? (
                                        issues.map((issue) => (
                                            <MenuItem 
                                                key={issue._id} 
                                                value={issue._id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    gap: 1,
                                                    py: 1
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            color: 'primary.main',
                                                            minWidth: '80px'
                                                        }}
                                                    >
                                                        {issue.key}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {issue.title}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                                    <Chip
                                                        label={issue.status}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getStatusColor(issue.status).bg,
                                                            color: getStatusColor(issue.status).color,
                                                            height: 24
                                                        }}
                                                    />
                                                    <Chip
                                                        label={issue.priority}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'white',
                                                            color: getPriorityColor(issue.priority),
                                                            border: 1,
                                                            borderColor: getPriorityColor(issue.priority),
                                                            height: 24
                                                        }}
                                                    />
                                                </Box>
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No issues available</MenuItem>
                                    )}
                                </Select>
                                {error && error.includes('issues') && (
                                    <FormHelperText error>{error}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: theme.spacing(2) }}>
                    <Button 
                        onClick={handleClose}
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                        disabled={loading}
                        sx={{
                            backgroundColor: '#0052CC',
                            '&:hover': { backgroundColor: '#0747A6' },
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : epic ? 'Update Epic' : 'Create Epic'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEpic;