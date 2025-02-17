import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    CircularProgress,
    Grid,
    Alert,
    Chip,
} from '@mui/material';
import { CheckCircle, Error, HourglassEmpty } from '@mui/icons-material';
import backlogItemService from '../service/BacklogItemService';
import sprintService from '../service/SprintService';
import projectService from '../service/ProjectService';
import userService from '../service/UserService';

const BacklogItems = () => {
    const [formValues, setFormValues] = useState({
        title: '',
        description: '',
        type: 'story',
        status: 'todo',
        effortEstimate: 0,
        sprint: '',
        project: '',
        assignedTo: '',
    });
    const [backlogItems, setBacklogItems] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            const [itemsResponse, sprintsResponse, projectsResponse, usersResponse] = await Promise.all([
                backlogItemService.getAll(),
                sprintService.getAll(),
                projectService.getAll(),
                userService.getAll(),
            ]);

            setBacklogItems(itemsResponse.data || []);
            setSprints(sprintsResponse.data || []);
            setProjects(projectsResponse.data || []);
            setUsers(usersResponse.data || []);
        } catch (err) {
            setError('Error fetching data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await backlogItemService.create(formValues);
            fetchInitialData();
            setFormValues({
                title: '',
                description: '',
                type: 'story',
                status: 'todo',
                effortEstimate: 0,
                sprint: '',
                project: '',
                assignedTo: '',
            });
            setOpenDialog(false);
        } catch (err) {
            setError('Error creating backlog item.');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done':
                return <CheckCircle color="success" />;
            case 'in-progress':
                return <HourglassEmpty color="warning" />;
            case 'todo':
                return <Error color="error" />;
            default:
                return null;
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
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Backlog Items
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Box mb={3} display="flex" justifyContent="space-between">
                <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                    Add Backlog Item
                </Button>
            </Box>
            <Grid container spacing={3}>
                {backlogItems.length > 0 ? (
                    backlogItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {item.description || 'No description provided'}
                                    </Typography>
                                    <Chip label={`Type: ${item.type}`} sx={{ mr: 1 }} />
                                    <Chip
                                        label={`Status: ${item.status}`}
                                        icon={getStatusIcon(item.status)}
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="body2">Effort: {item.effortEstimate}</Typography>
                                    {item.sprint && (
                                        <Typography variant="body2">
                                            Sprint: {sprints.find((sprint) => sprint._id === item.sprint)?.name || 'Unknown'}
                                        </Typography>
                                    )}
                                    {item.project && (
                                        <Typography variant="body2">
                                            Project: {projects.find((project) => project._id === item.project)?.projectName || 'Unknown'}
                                        </Typography>
                                    )}
                                    {item.assignedTo && (
                                        <Typography variant="body2">
                                            Assigned To: {users.find((user) => user._id === item.assignedTo)?.username || 'Unknown'}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button size="small" color="primary">
                                        Edit
                                    </Button>
                                    <Button size="small" color="error">
                                        Delete
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography>No backlog items found.</Typography>
                )}
            </Grid>

            {/* Add Backlog Item Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add Backlog Item</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Title"
                            name="title"
                            value={formValues.title}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={formValues.description}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Type</InputLabel>
                            <Select name="type" value={formValues.type} onChange={handleInputChange}>
                                <MenuItem value="story">Story</MenuItem>
                                <MenuItem value="task">Task</MenuItem>
                                <MenuItem value="bug">Bug</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select name="status" value={formValues.status} onChange={handleInputChange}>
                                <MenuItem value="todo">To Do</MenuItem>
                                <MenuItem value="in-progress">In Progress</MenuItem>
                                <MenuItem value="done">Done</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Effort Estimate"
                            name="effortEstimate"
                            type="number"
                            value={formValues.effortEstimate}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Sprint</InputLabel>
                            <Select name="sprint" value={formValues.sprint} onChange={handleInputChange}>
                                <MenuItem value="">None</MenuItem>
                                {sprints.map((sprint) => (
                                    <MenuItem key={sprint._id} value={sprint._id}>
                                        {sprint.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Project</InputLabel>
                            <Select name="project" value={formValues.project} onChange={handleInputChange}>
                                <MenuItem value="">None</MenuItem>
                                {projects.map((project) => (
                                    <MenuItem key={project._id} value={project._id}>
                                        {project.projectName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Assigned To</InputLabel>
                            <Select name="assignedTo" value={formValues.assignedTo} onChange={handleInputChange}>
                                <MenuItem value="">None</MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                        Add Item
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BacklogItems;
