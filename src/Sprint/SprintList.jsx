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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import sprintService from '../service/SprintService';
import projectService from '../service/ProjectService';
import backlogItemService from '../service/BacklogItemService';

// Styled Components for Enhanced UI
const StyledAccordion = styled(Accordion)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    '&:before': {
        display: 'none', // Remove the default border
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    '& .MuiAccordionSummary-content': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    '&:hover': {
        backgroundColor: theme.palette.grey[200],
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(3),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledChip = styled(Chip)(({ theme, status }) => ({
    fontWeight: 'bold',
    ...(status === 'Active' && { backgroundColor: theme.palette.success.light, color: theme.palette.success.contrastText }),
    ...(status === 'Completed' && { backgroundColor: theme.palette.grey[400], color: theme.palette.grey[900] }),
    ...(status === 'Future' && { backgroundColor: theme.palette.warning.light, color: theme.palette.warning.contrastText }),
}));

const StyledAddButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
    },
}));

const SprintList = () => {
    const [sprints, setSprints] = useState([]);
    const [projects, setProjects] = useState([]);
    const [allBacklogItems, setAllBacklogItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [addBacklogItemDialogOpen, setAddBacklogItemDialogOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [newSprint, setNewSprint] = useState({
        sprintName: '',
        startDate: '',
        endDate: '',
        goal: '',
        capacity: 0,
        project: '',
    });
    const [selectedBacklogItems, setSelectedBacklogItems] = useState([]);

    // Fetch data using useCallback for memoization
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
            setError('Failed to fetch data. Please check your server or network connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddSprint = async () => {
        if (!newSprint.sprintName || !newSprint.startDate || !newSprint.endDate || !newSprint.project) {
            setError('All fields except "goal" and "capacity" are required.');
            return;
        }
        try {
            await sprintService.create(newSprint);
            setNewSprint({
                sprintName: '',
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

        if (today < startDate) {
            return 'Future';
        } else if (today > endDate) {
            return 'Completed';
        } else {
            return 'Active';
        }
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>Sprint Management</Typography>
                <Tooltip title="Add New Sprint">
                    <StyledAddButton color="primary" onClick={() => setAddDialogOpen(true)}>
                        <AddIcon />
                    </StyledAddButton>
                </Tooltip>
            </Box>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            ) : (
                sprints.map((sprint) => (
                    <StyledAccordion key={sprint._id}>
                        <StyledAccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>{sprint.sprintName}</Typography>
                                <Typography variant="body2" sx={{ color: '#757575', mr: 2 }}>
                                    {`${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}`}
                                </Typography>
                            </Box>
                            <StyledChip label={getSprintStatus(sprint)} status={getSprintStatus(sprint)} />
                        </StyledAccordionSummary>
                        <StyledAccordionDetails>
                            <Typography variant="body2" gutterBottom>
                                <strong>Goal:</strong> {sprint.goal || 'No goal set'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Capacity:</strong> {sprint.capacity || 'Not defined'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Project:</strong> {sprint.project?.projectName || 'No project assigned'}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => handleOpenAddBacklogItemDialog(sprint)}
                                sx={{ mt: 2 }}
                            >
                                Add Backlog Items
                            </Button>
                            <Collapse in={sprint.backlogItems?.length > 0} sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    {sprint.backlogItems?.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                                            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 1 }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    {item.title}
                                                </Typography>
                                                <Chip
                                                    label={`Status: ${item.status}`}
                                                    color={
                                                        item.status === 'done'
                                                            ? 'success'
                                                            : item.status === 'in-progress'
                                                                ? 'warning'
                                                                : 'default'
                                                    }
                                                    sx={{ mt: 1 }}
                                                />
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Collapse>
                            <Collapse in={!sprint.backlogItems?.length > 0} sx={{ mt: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    No backlog items assigned to this sprint.
                                </Typography>
                            </Collapse>
                        </StyledAccordionDetails>
                    </StyledAccordion>
                ))
            )}

            {/* Add Sprint Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Sprint</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Sprint Name"
                        value={newSprint.sprintName}
                        onChange={(e) => setNewSprint({ ...newSprint, sprintName: e.target.value })}
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

            {/* Add Backlog Item to Sprint Dialog */}
            <Dialog
                open={addBacklogItemDialogOpen}
                onClose={handleCloseAddBacklogItemDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Add Backlog Items to Sprint</DialogTitle>
                <DialogContent>
                    <List>
                        {filteredBacklogItems.map((item) => (
                            <ListItem
                                key={item._id}
                                button
                                onClick={() => handleToggleBacklogItem(item._id)}
                                selected={selectedBacklogItems.includes(item._id)}
                            >
                                <ListItemText primary={item.title} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddBacklogItemDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddBacklogItemsToSprint}>
                        Add Items
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SprintList;
