import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectService from "../service/ProjectService";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Typography,
    Button,
    TablePagination,
    Chip,
    TableSortLabel,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";

const ListProject = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    useEffect(() => {
        retrieveProjects();
    }, []);

    const retrieveProjects = () => {
        ProjectService.getAll()
            .then((response) => {
                setProjects(response.data);
            })
            .catch((e) => {
                console.error("Error retrieving projects:", e);
            });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
    };

    const sortProjects = (projectsToSort) => {
        if (!sortConfig.key) return projectsToSort;

        return [...projectsToSort].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const filteredProjects = projects.filter(project =>
        project?.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedProjects = sortProjects(filteredProjects);

    const paginatedProjects = sortedProjects.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleCreateProject = () => {
        navigate("/projects/create");
    };

    const handleEditProject = (projectId) => {
        navigate(`/projects/edit/${projectId}`);
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (projectToDelete) {
            ProjectService.remove(projectToDelete.id)
                .then(() => {
                    retrieveProjects();
                    setDeleteDialogOpen(false);
                    setProjectToDelete(null);
                })
                .catch((e) => {
                    console.error("Error deleting project:", e);
                    setDeleteDialogOpen(false);
                    setProjectToDelete(null);
                });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
    };

    const handleViewAnalytics = (projectId) => {
        navigate(`/projects/${projectId}/analytics`);
    };

    const handleViewTimeline = (projectId) => {
        navigate(`/projects/${projectId}/timeline`);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "success";
            case "completed":
                return "info";
            case "on hold":
                return "warning";
            case "cancelled":
                return "error";
            default:
                return "default";
        }
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateProject}
                >
                    Create Project
                </Button>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearch}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                onClick={() => handleSort('projectName')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Project Name {renderSortIcon('projectName')}
                                </Box>
                            </TableCell>
                            <TableCell
                                onClick={() => handleSort('description')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Description {renderSortIcon('description')}
                                </Box>
                            </TableCell>
                            <TableCell
                                onClick={() => handleSort('status')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Status {renderSortIcon('status')}
                                </Box>
                            </TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProjects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>{project.projectName}</TableCell>
                                <TableCell>{project.description}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={project.status}
                                        color={getStatusColor(project.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleViewAnalytics(project.id)}
                                        title="View Analytics"
                                    >
                                        <AssessmentIcon />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleViewTimeline(project.id)}
                                        title="View Timeline"
                                    >
                                        <TimelineIcon />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleEditProject(project.id)}
                                        title="Edit Project"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteClick(project)}
                                        title="Delete Project"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredProjects.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the project "{projectToDelete?.projectName}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListProject;
