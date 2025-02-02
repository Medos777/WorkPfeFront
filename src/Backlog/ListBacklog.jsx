 import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Tooltip,
    IconButton,
    Divider,
    Chip,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import {
    SaveAlt as SaveAltIcon,
    Delete as DeleteIcon,
    Edit as EditIcon, Add as AddIcon,
} from "@mui/icons-material";
import backlogService from "../service/BacklogService";
import backlogItemService from "../service/BacklogItemService";
import { saveAs } from "file-saver";
 import AddBacklog from "./AddBacklog";

const ListBacklog = () => {
    const [backlogs, setBacklogs] = useState([]);
    const [backlogItems, setBacklogItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBacklog, setSelectedBacklog] = useState(null);
    const [editedBacklogName, setEditedBacklogName] = useState("");
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    // Get user role from localStorage
    const userRole = localStorage.getItem('role');
    const isDeveloper = userRole === 'developer';

    useEffect(() => {
        fetchBacklogs();
    }, []);

    const fetchBacklogs = async () => {
        try {
            setLoading(true);
            const [backlogsResponse, itemsResponse] = await Promise.all([
                backlogService.getAll(),
                backlogItemService.getAll(),
            ]);
            setBacklogs(backlogsResponse.data || []);
            setBacklogItems(itemsResponse.data || []);
        } catch (err) {
            setError("Failed to fetch backlogs. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (backlog) => {
        const headers = "Backlog Name,Project,Item Title,Item Description,Item Type,Item Status\n";
        const items = backlog.items
            .map((itemId) => {
                const item = backlogItems.find((item) => item._id === itemId);
                if (!item) return null;
                return `${backlog.name},${backlog.project.projectName},${item.title},${item.description},${item.type},${item.status}`;
            })
            .filter(Boolean)
            .join("\n");

        const csv = headers + items;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${backlog.name.replace(/\s+/g, "_")}_backlog.csv`);
    };

    const getItemNames = (itemIds) => {
        return itemIds
            .map((id) => backlogItems.find((item) => item._id === id)?.title || "Unknown")
            .join(", ");
    };

    const handleEditBacklog = (backlog) => {
        setSelectedBacklog(backlog);
        setEditedBacklogName(backlog.name);
        setEditDialogOpen(true);
    };

    const handleEditSave = async () => {
        try {
            await backlogService.update(selectedBacklog._id, { name: editedBacklogName });
            setEditDialogOpen(false);
            fetchBacklogs();
        } catch (err) {
            setError("Failed to update backlog. Please try again.");
        }
    };

    const handleDeleteBacklog = async (id) => {
        try {
            await backlogService.deleteacklog(id);
            fetchBacklogs();
        } catch (err) {
            setError("Failed to delete backlog. Please try again.");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }
    const handleAddBacklogOpen = () => setAddDialogOpen(true);

    const handleAddBacklogClose = () => setAddDialogOpen(false);

    const handleBacklogCreated = () => {
        fetchBacklogs();
        handleAddBacklogClose();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" gutterBottom>
                    Backlogs
                </Typography>
                {!isDeveloper && (
                    <Tooltip title="Add New Backlog">
                        <IconButton color="primary" onClick={handleAddBacklogOpen}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Grid container spacing={3}>
                {backlogs.length > 0 ? (
                    backlogs.map((backlog) => (
                        <Grid item xs={12} sm={6} md={4} key={backlog._id}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {backlog.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Project: {backlog.project?.projectName || "No Project"}
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>
                                        Items:
                                    </Typography>
                                    {backlog.items.length > 0 ? (
                                        backlog.items.map((itemId) => {
                                            const item = backlogItems.find((item) => item._id === itemId);
                                            return (
                                                <Chip
                                                    key={itemId}
                                                    label={item?.title || "Unknown"}
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                    color="primary"
                                                />
                                            );
                                        })
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            No items in this backlog.
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Tooltip title="Edit Backlog">
                                        <IconButton onClick={() => handleEditBacklog(backlog)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {!isDeveloper && (
                                        <Tooltip title="Delete Backlog">
                                            <IconButton color="error" onClick={() => handleDeleteBacklog(backlog._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Export as CSV">
                                        <Button
                                            variant="outlined"
                                            startIcon={<SaveAltIcon />}
                                            onClick={() => exportToCSV(backlog)}
                                        >
                                            Export
                                        </Button>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No backlogs found.
                    </Typography>
                )}
            </Grid>

            <Dialog open={addDialogOpen} onClose={handleAddBacklogClose} maxWidth="sm" fullWidth>
                <AddBacklog open={addDialogOpen} onClose={handleAddBacklogClose} onBacklogCreated={handleBacklogCreated} />
            </Dialog>
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Edit Backlog</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Backlog Name"
                        value={editedBacklogName}
                        onChange={(e) => setEditedBacklogName(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListBacklog;