import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import sprintService from '../service/SprintService';
import projectService from '../service/ProjectService';

const SprintList = () => {
    const [sprints, setSprints] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newSprint, setNewSprint] = useState({
        sprintName: '',
        startDate: '',
        endDate: '',
        goal: '',
        capacity: 0,
        project: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sprintsResponse, projectsResponse] = await Promise.all([
                sprintService.getAll(),
                projectService.getAll(),
            ]);
            setSprints(sprintsResponse?.data || []);
            setProjects(projectsResponse?.data || []);
        } catch (err) {
            setError('Failed to fetch data. Please check your server or network connection.');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Sprint Management</Typography>
                <IconButton color="primary" onClick={() => setAddDialogOpen(true)}>
                    <AddIcon />
                </IconButton>
            </Box>
            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            ) : (
                sprints.map((sprint) => (
                    <Accordion key={sprint._id}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{sprint.sprintName}</Typography>
                            <Typography variant="body2" sx={{ ml: 2 }}>
                                {`${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}`}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2" gutterBottom>
                                <strong>Goal:</strong> {sprint.goal || 'No goal set'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Capacity:</strong> {sprint.capacity || 'Not defined'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Project:</strong> {sprint.project?.projectName || 'No project assigned'}
                            </Typography>
                            {sprint.backlogItems?.length > 0 ? (
                                <Grid container spacing={2}>
                                    {sprint.backlogItems.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ccc',
                                                    borderRadius: '8px',
                                                    p: 2,
                                                    textAlign: 'center',
                                                }}
                                            >
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
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No backlog items assigned to this sprint.
                                </Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
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
        </Box>
    );
};

export default SprintList;
