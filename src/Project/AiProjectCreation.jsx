import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack
} from '@mui/material';
import AiService from '../service/AiService';

const AiProjectCreation = ({ open, onClose, onGenerate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'software',
        industry: 'technology'
    });

    const projectTypes = [
        'software',
        'hardware',
        'consulting',
        'research',
        'marketing',
        'design'
    ];

    const industries = [
        'technology',
        'healthcare',
        'finance',
        'education',
        'retail',
        'manufacturing'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerate = async () => {
        if (!formData.description.trim()) {
            setError('Please provide a project description');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const projectStructure = await AiService.generateProjectStructure(formData);
            
            // Format the data for the form
            const formattedData = {
                projectName: projectStructure.name,
                projectDescription: projectStructure.description,
                startDate: projectStructure.startDate,
                endDate: projectStructure.endDate,
                budget: projectStructure.budget,
                costEstimate: projectStructure.costEstimate,
                teams: projectStructure.recommendedTeams.map(team => team.teamId),
                // Store additional data for display
                aiMetadata: {
                    keyFeatures: projectStructure.keyFeatures,
                    teamStructure: projectStructure.teamStructure,
                    recommendedTeams: projectStructure.recommendedTeams,
                    initialSprints: projectStructure.initialSprints,
                    keyMilestones: projectStructure.keyMilestones,
                    riskAssessment: projectStructure.riskAssessment
                }
            };

            onGenerate(formattedData);
            onClose();
        } catch (error) {
            console.error('Error generating project:', error);
            setError('Failed to generate project structure. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Generate Project with AI
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Describe your project and let AI help you create a detailed project structure.
                    </Typography>
                    
                    <TextField
                        fullWidth
                        margin="normal"
                        name="name"
                        label="Project Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        name="description"
                        label="Project Description"
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        required
                        helperText="Describe your project in detail, including goals, requirements, and any specific technologies or methodologies."
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Project Type</InputLabel>
                        <Select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            label="Project Type"
                        >
                            {projectTypes.map(type => (
                                <MenuItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Industry</InputLabel>
                        <Select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            label="Industry"
                        >
                            {industries.map(industry => (
                                <MenuItem key={industry} value={industry}>
                                    {industry.charAt(0).toUpperCase() + industry.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleGenerate}
                    variant="contained"
                    disabled={loading || !formData.description.trim()}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Generating...' : 'Generate'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AiProjectCreation;
