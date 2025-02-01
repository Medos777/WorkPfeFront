import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    Tooltip,
    styled,
    Paper,
    Slide,
    Collapse,
    Menu,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import sprintService from '../service/SprintService';
import projectService from '../service/ProjectService';
import backlogItemService from '../service/BacklogItemService';

// Styled Components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius + 'px !important',
    '&:before': {
        display: 'none',
    },
    '&.Mui-expanded': {
        margin: theme.spacing(2, 0),
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    '& .MuiAccordionSummary-content': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    '&:hover': {
        backgroundColor: theme.palette.grey[50],
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
}));

const StyledChip = styled(Chip)(({ theme, status }) => ({
    fontWeight: 'bold',
    borderRadius: '16px',
    ...(status === 'Active' && {
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.dark,
    }),
    ...(status === 'Completed' && {
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.grey[700],
    }),
    ...(status === 'Future' && {
        backgroundColor: theme.palette.info.light,
        color: theme.palette.info.dark,
    }),
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    '&:hover': {
        color: theme.palette.primary.main,
    },
}));

const SprintList = () => {
    const [sprints, setSprints] = useState([]);
    const [projects, setProjects] = useState([]);
    const [allBacklogItems, setAllBacklogItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addBacklogItemDialogOpen, setAddBacklogItemDialogOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [newSprint, setNewSprint] = useState({
        name: '',
        startDate: '',
        endDate: '',
        goal: '',
        capacity: 0,
        project: '',
    });
    const [selectedBacklogItems, setSelectedBacklogItems] = useState([]);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [sprintsResponse, projectsResponse, backlogItemsResponse] = await Promise.all([
                sprintService.getAll(),
                projectService.getAll(),
                backlogItemService.getAll(),
            ]);
            setSprints(sprintsResponse?.data || []);
            setProjects(projectsResponse?.data || []);
            setAllBacklogItems(backlogItemsResponse?.data || []);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMenuOpen = (event, sprint) => {
        setAnchorEl(event.currentTarget);
        setSelectedSprint(sprint);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        setNewSprint({
            name: selectedSprint.name,
            startDate: selectedSprint.startDate.split('T')[0],
            endDate: selectedSprint.endDate.split('T')[0],
            goal: selectedSprint.goal,
            capacity: selectedSprint.capacity,
            project: selectedSprint.project._id,
        });
        setEditDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleEdit = async () => {
        try {
            await sprintService.update(selectedSprint._id, newSprint);
            setEditDialogOpen(false);
            setSelectedSprint(null);
            fetchData();
        } catch (err) {
            setError('Failed to update sprint. Please try again.');
        }
    };

    const handleDelete = async () => {
        try {
            await sprintService.deleteSprint(selectedSprint._id);
            setDeleteDialogOpen(false);
            setSelectedSprint(null);
            fetchData();
        } catch (err) {
            setError('Failed to delete sprint. Please try again.');
        }
    };

    // Existing handlers
    const handleAddSprint = async () => {
        if (!newSprint.name || !newSprint.startDate || !newSprint.endDate || !newSprint.project) {
            setError('Please fill in all required fields.');
            return;
        }
        try {
            await sprintService.create(newSprint);
            setNewSprint({
                name: '',
                startDate: '',
                endDate: '',
                goal: '',
                capacity: 0,
                project: '',
            });
            setAddDialogOpen(false);
            fetchData();
        } catch (err) {
            setError('Failed to add sprint. Please try again.');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getSprintStatus = (sprint) => {
        const today = new Date();
        const startDate = new Date(sprint.startDate);
        const endDate = new Date(sprint.endDate);

        if (today < startDate) return 'Future';
        if (today > endDate) return 'Completed';
        return 'Active';
    };

    const handleOpenAddBacklogItemDialog = (sprint) => {
        setSelectedSprint(sprint);
        setSelectedBacklogItems(sprint.backlogItems || []);
        setAddBacklogItemDialogOpen(true);
    };

    const handleCloseAddBacklogItemDialog = () => {
        setAddBacklogItemDialogOpen(false);
        setSelectedSprint(null);
        setSelectedBacklogItems([]);
    };

    const handleAddBacklogItemsToSprint = async () => {
        if (!selectedSprint) return;
        try {
            await sprintService.update(selectedSprint._id, {
                backlogItems: selectedBacklogItems,
            });
            handleCloseAddBacklogItemDialog();
            fetchData();
        } catch (err) {
            setError('Failed to add backlog items to sprint. Please try again.');
        }
    };

    const handleToggleBacklogItem = (itemId) => {
        if (selectedBacklogItems.includes(itemId)) {
            setSelectedBacklogItems(selectedBacklogItems.filter((id) => id !== itemId));
        } else {
            setSelectedBacklogItems([...selectedBacklogItems, itemId]);
        }
    };

    // Memoize filtered backlog items
    const filteredBacklogItems = useMemo(() => {
        if (!selectedSprint) return [];
        return allBacklogItems.filter((item) => item.project === selectedSprint.project._id);
    }, [allBacklogItems, selectedSprint]);

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Sprint Management
                </Typography>
                <Tooltip title="Add New Sprint">
                    <IconButton
                        color="primary"
                        onClick={() => setAddDialogOpen(true)}
                        sx={{
                            backgroundColor: (theme) => theme.palette.primary.light,
                            '&:hover': {
                                backgroundColor: (theme) => theme.palette.primary.main,
                            },
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            ) : (
                sprints.map((sprint) => (
                    <StyledAccordion key={sprint._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
                                            {sprint.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mr: 2 }}>
                                            {`${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}`}
                                        </Typography>
                                        <StyledChip
                                            label={getSprintStatus(sprint)}
                                            status={getSprintStatus(sprint)}
                                            size="small"
                                        />
                                    </Box>
                                </StyledAccordionSummary>
                            </Box>
                            <ActionButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMenuOpen(e, sprint);
                                }}
                                sx={{ mr: 1 }}
                            >
                                <MoreVertIcon />
                            </ActionButton>
                        </Box>
                        <StyledAccordionDetails>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Goal:</strong> {sprint.goal || 'No goal set'}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Capacity:</strong> {sprint.capacity || 'Not defined'}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Project:</strong> {sprint.project?.projectName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleOpenAddBacklogItemDialog(sprint)}
                                        sx={{ mt: 2 }}
                                    >
                                        Manage Backlog Items
                                    </Button>
                                </Grid>
                            </Grid>
                        </StyledAccordionDetails>
                    </StyledAccordion>
                ))
            )}

            {/* Sprint Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleEditClick}>
                    <EditIcon sx={{ mr: 1 }} fontSize="small" />
                    Edit Sprint
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                    Delete Sprint
                </MenuItem>
            </Menu>

            {/* Edit Sprint Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Sprint</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Sprint Name"
                        value={newSprint.name}
                        onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Start Date"
                        type="date"
                        value={newSprint.startDate}
                        onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={newSprint.endDate}
                        onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        label="Goal"
                        value={newSprint.goal}
                        onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Capacity"
                        type="number"
                        value={newSprint.capacity}
                        onChange={(e) => setNewSprint({ ...newSprint, capacity: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={newSprint.project}
                            onChange={(e) => setNewSprint({ ...newSprint, project: e.target.value })}
                        >
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                    {project.projectName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEdit}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Sprint</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this sprint? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Sprint Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Sprint</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Sprint Name"
                        value={newSprint.name}
                        onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Start Date"
                        type="date"
                        value={newSprint.startDate}
                        onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={newSprint.endDate}
                        onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        label="Goal"
                        value={newSprint.goal}
                        onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Capacity"
                        type="number"
                        value={newSprint.capacity}
                        onChange={(e) => setNewSprint({ ...newSprint, capacity: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Project</InputLabel>
                        <Select
                            value={newSprint.project}
                            onChange={(e) => setNewSprint({ ...newSprint, project: e.target.value })}
                        >
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                    {project.projectName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddSprint}>
                        Add Sprint
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Backlog Items Dialog */}
            <Dialog
                open={addBacklogItemDialogOpen}
                onClose={handleCloseAddBacklogItemDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Backlog Items to Sprint</DialogTitle>
                <DialogContent>
                    {filteredBacklogItems.length > 0 ? (
                        <List>
                            {filteredBacklogItems.map((item) => (
                                <ListItem
                                    key={item._id}
                                    button
                                    onClick={() => handleToggleBacklogItem(item._id)}
                                    selected={selectedBacklogItems.includes(item._id)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 1,
                                        '&.Mui-selected': {
                                            backgroundColor: (theme) => theme.palette.primary.light,
                                        },
                                        '&.Mui-selected:hover': {
                                            backgroundColor: (theme) => theme.palette.primary.light,
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={item.title}
                                        secondary={`Status: ${item.status}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography color="textSecondary">
                            No available backlog items for this project.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddBacklogItemDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddBacklogItemsToSprint}
                        disabled={!selectedBacklogItems.length}
                    >
                        Add Selected Items
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SprintList;
