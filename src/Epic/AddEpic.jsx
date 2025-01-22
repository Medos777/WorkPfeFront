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
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import epicService from '../service/EpicService';
import projectService from '../service/ProjectService';

const AddEpic = ({ open, onClose, projectId: initialProjectId, userId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [projects, setProjects] = useState([]);
    const [epicData, setEpicData] = useState({
        name: '',
        description: '',
        project: initialProjectId || '',
        status: 'to do',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        labels: []
    });

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (initialProjectId) {
            setEpicData(prev => ({ ...prev, project: initialProjectId }));
        }
    }, [initialProjectId]);

    const loadProjects = async () => {
        try {
            const response = await projectService.getAll();
            setProjects(response.data);
        } catch (err) {
            console.error('Error loading projects:', err);
            setError('Failed to load projects');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'project' ? (value || '') : (value === '' ? undefined : value);
        console.log(`Changing ${name} to:`, newValue);
        setEpicData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const validateForm = () => {
        if (!epicData.name.trim()) {
            setError('Epic name is required');
            return false;
        }
        if (epicData.startDate && epicData.dueDate && new Date(epicData.startDate) > new Date(epicData.dueDate)) {
            setError('Start date cannot be after due date');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try { 
            // Create a new object for epic data
            const data = {
                name: epicData.name,
                description: epicData.description,
                status: epicData.status || 'to do',
                priority: epicData.priority || 'medium',
                owner: userId,
                project: epicData.project || null,  
            };

            // Only add dates if they are set
            if (epicData.startDate) {
                data.startDate = epicData.startDate;
            }
            if (epicData.dueDate) {
                data.dueDate = epicData.dueDate;
            }

            console.log('Epic data before submission:', epicData);
            console.log('Data being sent to server:', data);
            const response = await epicService.create(data);
            console.log('Epic created successfully:', response);
            onClose(true); // true indicates that we should refresh the list
            
            // Show success message
            setSuccess('Epic created successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create epic';
            setError(errorMessage);
            console.error('Error creating epic:', err);
        } finally {
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
            labels: []
        });
        setError('');
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Create New Epic</DialogTitle>
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

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            name="name"
                            label="Epic Name"
                            value={epicData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            name="description"
                            label="Description"
                            value={epicData.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            fullWidth
                        />

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <FormControl fullWidth>
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

                        <TextField
                            name="startDate"
                            label="Start Date"
                            type="date"
                            value={epicData.startDate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            name="dueDate"
                            label="Due Date"
                            type="date"
                            value={epicData.dueDate}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={loading}
                        sx={{
                            backgroundColor: '#0052CC',
                            '&:hover': { backgroundColor: '#0747A6' },
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create Epic'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddEpic;