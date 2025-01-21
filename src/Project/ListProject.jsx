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
    ButtonGroup,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    CalendarToday as CalendarIcon,
    Group as GroupIcon,
    Business as BusinessIcon,
    FilterList as FilterListIcon,
    ExpandMore as ExpandMoreIcon,
    Description as DescriptionIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import 'bootstrap/dist/css/bootstrap.min.css';
import './ListProject.css';

const ListProject = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [selectedProject, setSelectedProject] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
    });

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

    const filteredAndSortedProjects = sortedProjects.filter(project => {
        const matchesStatus = !filters.status || project.status === filters.status;
        const matchesStartDate = !filters.startDate || new Date(project.startDate) >= new Date(filters.startDate);
        const matchesEndDate = !filters.endDate || new Date(project.endDate) <= new Date(filters.endDate);
        return matchesStatus && matchesStartDate && matchesEndDate;
    });

    const paginatedProjects = filteredAndSortedProjects.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleCreateProject = () => {
        navigate("/projects/add");
    };

    const handleEditProject = (projectId) => {
        navigate(`/projects/update/${projectId}`);
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

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
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

    const statusOptions = ['Active', 'Completed', 'On Hold', 'Cancelled'];

    const renderTableContent = () => {
        return filteredProjects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((project, index) => (
            <TableRow 
                key={project.id}
                onClick={(e) => {
                    if (!e.target.closest('button')) {
                        localStorage.setItem('projectType', project.projectType);
                        window.dispatchEvent(new Event('storage'));
                        navigate(`/projects/${project.id}`);
                    }
                }}
                style={{ cursor: 'pointer' }}
                hover
            >
                <TableCell>{project.projectName}</TableCell>
                <TableCell>
                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {project.description}
                    </div>
                </TableCell>
                <TableCell>
                    <Chip
                        label={project.status || 'Active'}
                        color={getStatusColor(project.status)}
                        size="small"
                    />
                </TableCell>
                <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                    <div className="d-flex justify-content-end gap-2">
                        <Tooltip title="View Analytics">
                            <IconButton 
                                size="small" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAnalytics(project.id);
                                }}
                                className="analytics-button"
                            >
                                <AssessmentIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="View Timeline">
                            <IconButton 
                                size="small" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewTimeline(project.id);
                                }}
                                className="timeline-button"
                            >
                                <TimelineIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Project">
                            <IconButton 
                                size="small" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProject(project.id);
                                }}
                                className="edit-button"
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Project">
                            <IconButton 
                                size="small" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(project);
                                }}
                                className="delete-button"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="container-fluid px-4 py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center bg-white rounded-3 p-4 shadow-sm">
                        <div className="d-flex align-items-center">
                            <BusinessIcon className="text-primary me-2" style={{ fontSize: '2rem' }} />
                            <h2 className="mb-0">Projects</h2>
                        </div>
                        <div className="d-flex gap-3">
                            <ButtonGroup variant="outlined" className="view-toggle">
                                <Button
                                    onClick={() => setViewMode('table')}
                                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                                    startIcon={<ViewListIcon />}
                                    className={viewMode === 'table' ? 'active' : ''}
                                >
                                    List
                                </Button>
                                <Button
                                    onClick={() => setViewMode('card')}
                                    variant={viewMode === 'card' ? 'contained' : 'outlined'}
                                    startIcon={<ViewModuleIcon />}
                                    className={viewMode === 'card' ? 'active' : ''}
                                >
                                    Cards
                                </Button>
                            </ButtonGroup>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateProject}
                                className="create-button"
                            >
                                Create Project
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-12">
                    <Accordion className="filter-accordion">
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="filter-content"
                            id="filter-header"
                        >
                            <FilterListIcon className="me-2" />
                            <Typography>Filters</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="row g-3">
                                <div className="col-12 col-md-3">
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="Status"
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {statusOptions.map(status => (
                                            <MenuItem key={status} value={status}>{status}</MenuItem>
                                        ))}
                                    </TextField>
                                </div>
                                <div className="col-12 col-md-3">
                                    <TextField
                                        type="date"
                                        fullWidth
                                        size="small"
                                        label="Start Date"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </div>
                                <div className="col-12 col-md-3">
                                    <TextField
                                        type="date"
                                        fullWidth
                                        size="small"
                                        label="End Date"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </div>
                                <div className="col-12 col-md-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <SearchIcon className="text-muted" />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 ps-0"
                                            placeholder="Search projects..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="row">
                    <div className="col-12">
                        <div className="table-responsive">
                            <TableContainer component={Paper} className="table-container">
                                <Table className="table table-hover">
                                    <TableHead>
                                        <TableRow className="table-header">
                                            <TableCell className="fw-bold">Project Name</TableCell>
                                            <TableCell className="fw-bold">Description</TableCell>
                                            <TableCell className="fw-bold">Status</TableCell>
                                            <TableCell className="fw-bold">Start Date</TableCell>
                                            <TableCell className="fw-bold">End Date</TableCell>
                                            <TableCell className="fw-bold text-end">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {renderTableContent()}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {paginatedProjects.map((project) => (
                        <div key={project.id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100 project-card shadow-sm">
                                <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                                    <Chip
                                        label={project.status || 'Active'}
                                        color={getStatusColor(project.status)}
                                        size="small"
                                        className="status-chip"
                                    />
                                    <div className="project-actions">
                                        <Tooltip title="View Analytics">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleViewAnalytics(project.id)}
                                                className="action-button"
                                            >
                                                <AssessmentIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Timeline">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleViewTimeline(project.id)}
                                                className="action-button"
                                            >
                                                <TimelineIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title text-primary mb-3">{project.projectName}</h5>
                                    <p className="card-text text-muted project-description">
                                        {project.description}
                                    </p>
                                    <div className="project-info">
                                        <div className="info-item">
                                            <CalendarIcon className="info-icon" />
                                            <span className="info-text">
                                                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <GroupIcon className="info-icon" />
                                            <span className="info-text">
                                                {project.teams?.length || 0} Teams
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer bg-transparent border-0">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleEditProject(project.id)}
                                        >
                                            <EditIcon fontSize="small" /> Edit
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDeleteClick(project)}
                                        >
                                            <DeleteIcon fontSize="small" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="row mt-4">
                <div className="col-12">
                    <TablePagination
                        component="div"
                        count={filteredAndSortedProjects.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        className="bg-white rounded shadow-sm"
                    />
                </div>
            </div>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <div className="d-flex align-items-center">
                        <DescriptionIcon className="me-2" />
                        Confirm Delete
                    </div>
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to delete project "{projectToDelete?.projectName}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleDeleteConfirm}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ListProject;
