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
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepButton,
    Slide,
    Fade,
    styled
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TeamService from '../service/TeamService';
import UserService from '../service/UserService';
import ProjectService from '../service/ProjectService';
import { SmartToy, NavigateNext, NavigateBefore } from '@mui/icons-material';

const StyledStepLabel = styled(StepLabel)(({ theme }) => ({
    '& .MuiStepLabel-label': {
        color: theme.palette.text.secondary,
        '&.Mui-active': {
            color: theme.palette.primary.main,
            fontWeight: 600
        },
        '&.Mui-completed': {
            color: theme.palette.success.main
        }
    }
}));

const FormSlide = ({ in: inProp, direction = 'left', children }) => (
    <Slide direction={direction} in={inProp} mountOnEnter unmountOnExit>
        <Fade in={inProp}>
            <div>{children}</div>
        </Fade>
    </Slide>
);

const steps = [
    'Basic Information',
    'Team & Leadership',
    'Timeline & Budget'
];

const ProjectForm = forwardRef(({ isEdit = false, projectData = null, onSubmit, onAiClick, initialProjectType }, ref) => {
    const [formData, setFormData] = useState({
        projectName: '',
        projectDescription: '',
        projectType: initialProjectType || '',
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
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        if (currentSlide < 2) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrevious = () => {
        setError('');
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleStepClick = (step) => {
        const validationError = validateForm();
        if (!validationError || step < currentSlide) {
            setCurrentSlide(step);
            setError('');
        } else {
            setError(validationError);
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
        <Box sx={{ width: '100%', mb: 4 }}>
            <Container component="main" maxWidth="md">
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 2, sm: 4 },
                        mt: 3,
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Stepper 
                        activeStep={currentSlide} 
                        alternativeLabel 
                        nonLinear
                        sx={{ 
                            mb: 4,
                            '& .MuiStepConnector-line': {
                                borderColor: 'rgba(0, 0, 0, 0.12)'
                            }
                        }}
                    >
                        {steps.map((label, index) => (
                            <Step key={label} completed={index < currentSlide}>
                                <StepButton onClick={() => handleStepClick(index)}>
                                    <StyledStepLabel>{label}</StyledStepLabel>
                                </StepButton>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Fade in={!!error}>
                            <Alert 
                                severity="error" 
                                sx={{ mb: 3 }} 
                                onClose={() => setError('')}
                            >
                                {error}
                            </Alert>
                        </Fade>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <FormSlide in={currentSlide === 0} direction="left">
                            <Grid container spacing={3} sx={{ display: currentSlide === 0 ? 'flex' : 'none' }}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="projectName"
                                        name="projectName"
                                        label="Project Name"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        multiline
                                        rows={4}
                                        id="projectDescription"
                                        name="projectDescription"
                                        label="Project Description"
                                        value={formData.projectDescription}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="projectKey"
                                        name="projectKey"
                                        label="Project Key"
                                        value={formData.projectKey}
                                        disabled
                                        helperText="Auto-generated from Project Name and Start Date"
                                    />
                                </Grid>
                            </Grid>
                        </FormSlide>

                        <FormSlide in={currentSlide === 1} direction={currentSlide > 1 ? 'left' : 'right'}>
                            <Grid container spacing={3} sx={{ display: currentSlide === 1 ? 'flex' : 'none' }}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel id="projectLead-label">Project Lead</InputLabel>
                                        <Select
                                            required
                                            labelId="projectLead-label"
                                            id="projectLead"
                                            name="projectLead"
                                            value={formData.projectLead}
                                            onChange={handleChange}
                                            label="Project Lead"
                                        >
                                            {users.map((user) => (
                                                <MenuItem key={user._id} value={user._id}>
                                                    {user.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel id="teams-label">Teams</InputLabel>
                                        <Select
                                            labelId="teams-label"
                                            id="teams"
                                            multiple
                                            value={formData.teams}
                                            onChange={handleTeamChange}
                                            label="Teams"
                                        >
                                            {teams.map((team) => (
                                                <MenuItem key={team._id} value={team._id}>
                                                    {team.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FormSlide>

                        <FormSlide in={currentSlide === 2} direction="right">
                            <Grid container spacing={3} sx={{ display: currentSlide === 2 ? 'flex' : 'none' }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="startDate"
                                        name="startDate"
                                        label="Start Date"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="endDate"
                                        name="endDate"
                                        label="End Date"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="budget"
                                        name="budget"
                                        label="Budget"
                                        type="number"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: '$',
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="costEstimate"
                                        name="costEstimate"
                                        label="Cost Estimate"
                                        type="number"
                                        value={formData.costEstimate}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: '$',
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </FormSlide>

                        <Box 
                            display="flex" 
                            justifyContent="space-between" 
                            mt={4}
                            sx={{
                                '& .MuiButton-root': {
                                    minWidth: 100
                                }
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={handlePrevious}
                                disabled={currentSlide === 0}
                                startIcon={<NavigateBefore />}
                            >
                                Back
                            </Button>
                            <Box>
                                {onAiClick && (
                                    <Tooltip title="Generate project details using AI">
                                        <Button
                                            onClick={onAiClick}
                                            startIcon={<SmartToy />}
                                            sx={{ mr: 2 }}
                                        >
                                            AI Assist
                                        </Button>
                                    </Tooltip>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={currentSlide === 2 ? handleSubmit : handleNext}
                                    endIcon={currentSlide < 2 ? <NavigateNext /> : null}
                                    disabled={loading}
                                >
                                    {currentSlide === 2 ? (isEdit ? 'Update' : 'Create') : 'Next'}
                                    {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Snackbar 
                    open={!!error || !!success} 
                    autoHideDuration={6000} 
                    onClose={() => {
                        setError('');
                        setSuccess('');
                    }}
                >
                    <Alert 
                        onClose={() => {
                            setError('');
                            setSuccess('');
                        }} 
                        severity={error ? 'error' : 'success'} 
                        sx={{ width: '100%' }}
                    >
                        {error || success}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
});

export default ProjectForm;
