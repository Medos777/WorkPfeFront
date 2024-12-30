import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import backlogService from '../service/BacklogService';
import ProjectService from '../service/ProjectService';

const AddBacklog = ({ open, onClose, onBacklogCreated }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBacklog, setNewBacklog] = useState({
        name: '',
        project: '',
        items: [],
    });
    const [itemInput, setItemInput] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await ProjectService.getAll();
                setProjects(response.data || []);
                setError(null);
            } catch (err) {
                setError('Failed to fetch projects');
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleAddItem = () => {
        if (itemInput.trim()) {
            setNewBacklog((prev) => ({
                ...prev,
                items: [...prev.items, itemInput.trim()],
            }));
            setItemInput('');
        }
    };

    const handleRemoveItem = (index) => {
        setNewBacklog((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const handleCreate = async () => {
        if (!newBacklog.name || !newBacklog.project) {
            setError('Name and Project are required fields');
            return;
        }
        try {
            await backlogService.create(newBacklog);
            setNewBacklog({ name: '', project: '', items: [] });
            onBacklogCreated();
            onClose();
        } catch (err) {
            setError('Failed to create backlog');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Backlog</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            label="Backlog Name"
                            fullWidth
                            margin="normal"
                            value={newBacklog.name}
                            onChange={(e) => setNewBacklog({ ...newBacklog, name: e.target.value })}
                        />
                        <Select
                            fullWidth
                            value={newBacklog.project}
                            onChange={(e) => setNewBacklog({ ...newBacklog, project: e.target.value })}
                            displayEmpty
                        >
                            <MenuItem value="">
                                <em>Select a Project</em>
                            </MenuItem>
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                    {project.projectName}
                                </MenuItem>
                            ))}
                        </Select>
                        <Typography variant="h6" sx={{ mt: 2 }}>Backlog Items</Typography>
                        <Box display="flex" gap={1} alignItems="center">
                            <TextField
                                label="Add Item"
                                fullWidth
                                margin="normal"
                                value={itemInput}
                                onChange={(e) => setItemInput(e.target.value)}
                            />
                            <Button onClick={handleAddItem} variant="contained" startIcon={<Add />}>
                                Add
                            </Button>
                        </Box>
                        <List dense>
                            {newBacklog.items.map((item, index) => (
                                <ListItem key={index} secondaryAction={
                                    <IconButton edge="end" onClick={() => handleRemoveItem(index)}>
                                        <Delete />
                                    </IconButton>
                                }>
                                    <ListItemText primary={item} />
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleCreate}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddBacklog;
