import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Box,
    Button,
    Container,
    CssBaseline,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
    Grid,
    Paper
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TeamService from '../service/TeamService';
import UserService from '../service/UserService';
import ProjectService from '../service/ProjectService';
import { SmartToy } from '@mui/icons-material';

const ProjectForm = forwardRef(({ isEdit = false, projectData = null, onSubmit, onAiClick }, ref) => {
    const [formData, setFormData] = useState({
        projectName: '',
        projectDescription: '',
        projectType: '',
        projectKey: '',
        startDate: '',
        endDate: '',
        projectLead: '',
        createdBy: localStorage.getItem('userId'),
        teams: [],
        budget: '',
        costEstimate: '',
    });
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [initialLoad, setInitialLoad] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const navigate = useNavigate();
    const { projectId } = useParams();
    const currentUser = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsResponse, usersResponse] = await Promise.all([
                    TeamService.getAll(),
                    UserService.getAll(),
                ]);
                setTeams(teamsResponse.data);
                setUsers(usersResponse.data);

                if (isEdit && projectId && initialLoad) {
                    const projectResponse = await ProjectService.getProject(projectId);
                    setFormData(projectResponse.data);
                    setInitialLoad(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load required data');
            }
        };

        fetchData();
    }, [projectId, isEdit, initialLoad]);

    // Expose method to update form data from parent
    useImperativeHandle(ref, () => ({
        updateFormData: (newData) => {
            setFormData(currentData => ({
                ...currentData,
                ...newData
            }));
        }
    }));

    const generateProjectKey = (projectName, startDate) => {
        if (!projectName || !startDate) return '';
        const namePrefix = projectName.substring(0, 2).toUpperCase();
        const date = new Date(startDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(2);
        return `${namePrefix}${month}${year}`;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-generate project key when project name or start date changes
            if ((name === 'projectName' || name === 'startDate') && (newData.projectName && newData.startDate)) {
                newData.projectKey = generateProjectKey(newData.projectName, newData.startDate);
            }
            
            return newData;
        });
    };

    const handleTeamChange = (event) => {
        const { value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            teams: value,
        }));
    };

    const validateForm = () => {
        if (currentSlide === 0) {
            if (!formData.projectName.trim()) return 'Project Name is required';
            if (!formData.projectDescription.trim()) return 'Project Description is required';
            if (!formData.projectType.trim()) return 'Project Type is required';
        } else if (currentSlide === 1) {
            if (!formData.projectLead) return 'Project Lead is required';
        } else if (currentSlide === 2) {
            if (!formData.startDate) return 'Start Date is required';
            if (!formData.endDate) return 'End Date is required';
            if (new Date(formData.endDate) <= new Date(formData.startDate))
                return 'End Date must be after Start Date';
            if (formData.budget && isNaN(Number(formData.budget)))
                return 'Budget must be a valid number';
            if (formData.costEstimate && isNaN(Number(formData.costEstimate)))
                return 'Cost Estimate must be a valid number';
        }
        return null;
    };

    const handleNext = () => {
        if (currentSlide < 2) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        if (currentSlide === 2) {
            try {
                const payload = {
                    ...formData,
                    createdBy: currentUser,
                };

                if (onSubmit) {
                    await onSubmit(projectId, payload);
                    setSuccess(isEdit ? 'Project updated successfully!' : 'Project created successfully!');
                    setTimeout(() => navigate('/projects'), 2000);
                }
            } catch (error) {
                console.error('Failed to submit project', error);
                let errorMessage = 'Failed to submit project. Please try again.';
                if (error.response) {
                    errorMessage = error.response.data.message || errorMessage;
                } else if (error.request) {
                    errorMessage = 'No response received from server. Please check your connection.';
                } else {
                    errorMessage = error.message || errorMessage;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        } else {
            handleNext();
        }
    };

    if (loading && !initialLoad) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: { xs: 2, sm: 4, md: 6 },
                pt: { xs: 4, sm: 6, md: 8 },
            }}
        >
            <Container component="main" maxWidth="md">
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 2, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 2,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {currentSlide === 0 && (
                                <>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="projectName"
                                            label="Project Name"
                                            name="projectName"
                                            value={formData.projectName}
                                            onChange={handleChange}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            multiline
                                            rows={4}
                                            id="projectDescription"
                                            label="Description"
                                            name="projectDescription"
                                            value={formData.projectDescription}
                                            onChange={handleChange}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl 
                                            fullWidth
                                            required
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        >
                                            <InputLabel id="projectType-label">Project Type</InputLabel>
                                            <Select
                                                labelId="projectType-label"
                                                id="projectType"
                                                name="projectType"
                                                value={formData.projectType}
                                                onChange={handleChange}
                                                label="Project Type"
                                            >
                                                <MenuItem value="Scrum">Scrum</MenuItem>
                                                <MenuItem value="Kanban">Kanban</MenuItem>
                                                <MenuItem value="simple">Simple</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            id="projectKey"
                                            label="Project Key"
                                            name="projectKey"
                                            value={formData.projectKey}
                                            disabled
                                            variant="outlined"
                                            helperText="Auto-generated from Project Name and Start Date"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                </>
                            )}
                            {currentSlide === 1 && (
                                <>
                                    <Grid item xs={12}>
                                        <FormControl 
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        >
                                            <InputLabel id="projectLead-label">Project Lead</InputLabel>
                                            <Select
                                                labelId="projectLead-label"
                                                id="projectLead"
                                                name="projectLead"
                                                value={formData.projectLead}
                                                onChange={handleChange}
                                                label="Project Lead"
                                                required
                                            >
                                                {users.map((user) => (
                                                    <MenuItem key={user._id} value={user._id}>
                                                        {user.username}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl 
                                            fullWidth
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        >
                                            <InputLabel id="teams-label">Select Teams</InputLabel>
                                            <Select
                                                labelId="teams-label"
                                                id="teams"
                                                multiple
                                                value={formData.teams}
                                                onChange={handleTeamChange}
                                                label="Select Teams"
                                            >
                                                {teams.map((team) => (
                                                    <MenuItem key={team._id} value={team._id}>
                                                        {team.teamName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}
                            {currentSlide === 2 && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="startDate"
                                            label="Start Date"
                                            name="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="endDate"
                                            label="End Date"
                                            name="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="budget"
                                            label="Budget"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: '€',
                                            }}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            id="costEstimate"
                                            label="Cost Estimate"
                                            name="costEstimate"
                                            value={formData.costEstimate}
                                            onChange={handleChange}
                                            InputProps={{
                                                startAdornment: '€',
                                            }}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        <Box display="flex" justifyContent="space-between" mt={3}>
                            <Button
                                variant="contained"
                                disabled={currentSlide === 0}
                                onClick={handlePrevious}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                            >
                                {currentSlide === 2 ? 'Submit' : 'Next'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                <Snackbar 
                    open={!!error} 
                    autoHideDuration={6000} 
                    onClose={() => setError('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={() => setError('')} 
                        severity="error" 
                        sx={{ 
                            width: '100%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        {error}
                    </Alert>
                </Snackbar>

                <Snackbar 
                    open={!!success} 
                    autoHideDuration={6000} 
                    onClose={() => setSuccess('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={() => setSuccess('')} 
                        severity="success"
                        sx={{ 
                            width: '100%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        {success}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
});

export default ProjectForm;
