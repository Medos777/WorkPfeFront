import React, { useRef, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Stepper,
    Step,
    StepLabel,
    styled,
    Paper,
    Divider,
    CardActionArea,
    useTheme,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import SprintIcon from '@mui/icons-material/Speed';
import BugReportIcon from '@mui/icons-material/BugReport';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CodeIcon from '@mui/icons-material/Code';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProjectForm from './ProjectForm';
import AiProjectCreation from './AiProjectCreation';
import ProjectService from '../service/ProjectService';

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

const ProjectTemplateCard = ({ title, description, icon: Icon, features, onClick, selected }) => {
    const theme = useTheme();
    
    return (
        <Card 
            sx={{ 
                height: '100%',
                borderColor: selected ? theme.palette.primary.main : 'transparent',
                borderWidth: 2,
                borderStyle: 'solid',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            <CardActionArea 
                onClick={onClick}
                sx={{ height: '100%', p: 2 }}
            >
                <Box 
                    sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        color: selected ? theme.palette.primary.main : theme.palette.text.primary
                    }}
                >
                    <Icon sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h6" component="h3">
                        {title}
                    </Typography>
                </Box>
                <Typography color="textSecondary" paragraph>
                    {description}
                </Typography>
                {features && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {features.map((feature, index) => (
                                <Typography 
                                    key={index} 
                                    component="li" 
                                    variant="body2" 
                                    color="textSecondary"
                                    sx={{ mb: 0.5 }}
                                >
                                    {feature}
                                </Typography>
                            ))}
                        </Box>
                    </>
                )}
            </CardActionArea>
        </Card>
    );
};

const projectTemplates = [
    {
        id: 'Scrum',
        title: 'Scrum',
        description: 'Plan and track your agile projects with sprints, backlogs, and customizable workflows.',
        icon: SprintIcon,
        features: [
            'Sprint planning and tracking',
            'Backlog management',
            'Burndown charts',
            'Sprint reports'
        ]
    },
    {
        id: 'Kanban',
        title: 'Kanban',
        description: 'Visualize and manage your work with a flexible Kanban board.',
        icon: ViewKanbanIcon,
        features: [
            'Customizable Kanban board',
            'Work in progress limits',
            'Continuous flow',
            'Lead time tracking'
        ]
    },
    {
        id: 'simple',
        title: 'Simple Project',
        description: 'A straightforward project setup for basic task management and tracking.',
        icon: ChecklistIcon,
        features: [
            'Basic task management',
            'Simple workflow',
            'Progress tracking',
            'Team collaboration'
        ]
    }
];

const steps = ['Select Project Type', 'Project Details'];

const AddProject = () => {
    const navigate = useNavigate();
    const formRef = useRef();
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [error, setError] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [projectType, setProjectType] = useState(null);
    const theme = useTheme();

    const handleSubmit = async (projectId, formData) => {
        try {
            await ProjectService.create({ ...formData, projectType });
            navigate('/projects');
        } catch (error) {
            console.error('Error creating project:', error);
            setError('Failed to create project');
            throw error;
        }
    };

    const handleTypeSelect = (type) => {
        setProjectType(type);
        setCurrentSlide(1);
    };

    const handleBack = () => {
        setCurrentSlide(0);
        setProjectType(null);
    };

    const handleAiGenerate = (generatedData) => {
        if (formRef.current) {
            formRef.current.updateFormData({
                projectName: generatedData.projectName,
                projectDescription: generatedData.projectDescription,
                startDate: generatedData.startDate,
                endDate: generatedData.endDate,
                budget: generatedData.budget,
                costEstimate: generatedData.costEstimate,
                teams: generatedData.teams || []
            });

            if (generatedData.aiMetadata) {
                localStorage.setItem('lastAiProjectMetadata', JSON.stringify(generatedData.aiMetadata));
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    {currentSlide === 1 && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            sx={{ mr: 2 }}
                        >
                            Back to templates
                        </Button>
                    )}
                    <Typography variant="h4" component="h1">
                        Create New Project
                    </Typography>
                </Box>

                <Stepper 
                    activeStep={currentSlide} 
                    sx={{ 
                        mb: 4,
                        '& .MuiStepConnector-line': {
                            borderColor: 'rgba(0, 0, 0, 0.12)'
                        }
                    }}
                >
                    {steps.map((label) => (
                        <Step key={label}>
                            <StyledStepLabel>{label}</StyledStepLabel>
                        </Step>
                    ))}
                </Stepper>

                {currentSlide === 0 ? (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Choose a template
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 4 }}>
                            Select a template that best fits your project needs. You can customize it further in the next step.
                        </Typography>
                        <Grid container spacing={3}>
                            {projectTemplates.map((template) => (
                                <Grid item xs={12} sm={6} md={4} key={template.id}>
                                    <ProjectTemplateCard
                                        {...template}
                                        selected={projectType === template.id}
                                        onClick={() => handleTypeSelect(template.id)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ) : (
                    <Paper 
                        elevation={1} 
                        sx={{ 
                            p: 3,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <ProjectForm
                            ref={formRef}
                            onSubmit={handleSubmit}
                            onAiClick={() => setAiDialogOpen(true)}
                            initialProjectType={projectType}
                        />

                        <AiProjectCreation
                            open={aiDialogOpen}
                            onClose={() => setAiDialogOpen(false)}
                            onGenerate={handleAiGenerate}
                        />
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default AddProject;
