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
    Chip,
    InputLabel,
    FormControl,
} from '@mui/material';
import { Delete, Add as AddIcon } from '@mui/icons-material';
import backlogService from '../service/BacklogService';
import ProjectService from '../service/ProjectService';
import backlogItemService from '../service/BacklogItemService';

const AddBacklog = ({ open, onClose, onBacklogCreated }) => {
    const [projects, setProjects] = useState([]);
    const [allBacklogItems, setAllBacklogItems] = useState([]);
    const [filteredBacklogItems, setFilteredBacklogItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBacklog, setNewBacklog] = useState({
        name: '',
        project: '',
        items: [],
    });
    const [openBacklogItemDialog, setOpenBacklogItemDialog] = useState(false);
    const [newBacklogItem, setNewBacklogItem] = useState({
        title: '',
        description: '',
        type: 'story',
        status: 'todo',
        project: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projectsResponse, backlogItemsResponse] = await Promise.all([
                    ProjectService.getAll(),
                    backlogItemService.getAll(),
                ]);
                setProjects(projectsResponse.data || []);
                setAllBacklogItems(backlogItemsResponse.data || []);
                setError(null);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleProjectChange = (projectId) => {
        setNewBacklog((prev) => ({ ...prev, project: projectId, items: [] }));
        setNewBacklogItem((prev) => ({ ...prev, project: projectId })); // Automatically set project for new backlog items
        const filteredItems = allBacklogItems.filter((item) => item.project === projectId);
        setFilteredBacklogItems(filteredItems);
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

    const handleAddBacklogItem = async () => {
        if (!newBacklogItem.title || !newBacklogItem.project) {
            setError('Backlog Item title and project are required');
            return;
        }
        try {
            const createdItem = await backlogItemService.create(newBacklogItem);
            setAllBacklogItems((prev) => [...prev, createdItem.data]);
            setFilteredBacklogItems((prev) => [...prev, createdItem.data]);
            setNewBacklog((prev) => ({
                ...prev,
                items: [...prev.items, createdItem.data._id],
            }));
            setNewBacklogItem({
                title: '',
                description: '',
                type: 'story',
                status: 'todo',
                project: newBacklog.project,
            });
            setOpenBacklogItemDialog(false);
        } catch (err) {
            setError('Failed to create backlog item');
        }
    };

    const handleRemoveItem = (itemId) => {
        setNewBacklog((prev) => ({
            ...prev,
            items: prev.items.filter((id) => id !== itemId),
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Backlog</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                    label="Backlog Name"
                    fullWidth
                    margin="normal"
                    value={newBacklog.name}
                    onChange={(e) => setNewBacklog({ ...newBacklog, name: e.target.value })}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Project</InputLabel>
                    <Select
                        value={newBacklog.project}
                        onChange={(e) => handleProjectChange(e.target.value)}
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
                </FormControl>
                <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                    <Typography variant="h6">Backlog Items</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenBacklogItemDialog(true)}
                    >
                        Add Backlog Item
                    </Button>
                </Box>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Select Items</InputLabel>
                    <Select
                        multiple
                        value={newBacklog.items}
                        onChange={(e) => setNewBacklog({ ...newBacklog, items: e.target.value })}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip
                                        key={value}
                                        label={
                                            filteredBacklogItems.find((item) => item._id === value)?.title || ''
                                        }
                                    />
                                ))}
                            </Box>
                        )}
                    >
                        {filteredBacklogItems.map((item) => (
                            <MenuItem key={item._id} value={item._id}>
                                {item.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <List dense>
                    {newBacklog.items.map((itemId) => (
                        <ListItem
                            key={itemId}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleRemoveItem(itemId)}>
                                    <Delete />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={
                                    filteredBacklogItems.find((item) => item._id === itemId)?.title || ''
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleCreate}>
                    Create
                </Button>
            </DialogActions>

            {/* Dialog for Adding Backlog Item */}
            <Dialog open={openBacklogItemDialog} onClose={() => setOpenBacklogItemDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Backlog Item</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        fullWidth
                        margin="normal"
                        value={newBacklogItem.title}
                        onChange={(e) => setNewBacklogItem({ ...newBacklogItem, title: e.target.value })}
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        margin="normal"
                        value={newBacklogItem.description}
                        onChange={(e) => setNewBacklogItem({ ...newBacklogItem, description: e.target.value })}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={newBacklogItem.type}
                            onChange={(e) => setNewBacklogItem({ ...newBacklogItem, type: e.target.value })}
                        >
                            <MenuItem value="story">Story</MenuItem>
                            <MenuItem value="task">Task</MenuItem>
                            <MenuItem value="bug">Bug</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={newBacklogItem.status}
                            onChange={(e) => setNewBacklogItem({ ...newBacklogItem, status: e.target.value })}
                        >
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBacklogItemDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddBacklogItem}>
                        Add Item
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default AddBacklog;
