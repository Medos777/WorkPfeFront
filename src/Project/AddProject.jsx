import React, { useRef, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectForm from './ProjectForm';
import AiProjectCreation from './AiProjectCreation';
import ProjectService from '../service/ProjectService';

const AddProject = () => {
    const navigate = useNavigate();
    const formRef = useRef();
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (projectId, formData) => {
        try {
            await ProjectService.create(formData);
            navigate('/projects');
        } catch (error) {
            console.error('Error creating project:', error);
            setError('Failed to create project');
            throw error; // Re-throw to be handled by the form
        }
    };

    const handleAiGenerate = (generatedData) => {
        if (formRef.current) {
            // Update form with AI-generated data
            formRef.current.updateFormData({
                projectName: generatedData.projectName,
                projectDescription: generatedData.projectDescription,
                startDate: generatedData.startDate,
                endDate: generatedData.endDate,
                budget: generatedData.budget,
                costEstimate: generatedData.costEstimate,
                teams: generatedData.teams || []
            });

            // Store additional AI metadata if needed
            if (generatedData.aiMetadata) {
                // You can store this in local storage or state if needed for later use
                localStorage.setItem('lastAiProjectMetadata', JSON.stringify(generatedData.aiMetadata));
            }
        }
    };

    return (
        <Container>
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Create New Project
                </Typography>
                
                <ProjectForm
                    ref={formRef}
                    onSubmit={handleSubmit}
                    onAiClick={() => setAiDialogOpen(true)}
                />

                <AiProjectCreation
                    open={aiDialogOpen}
                    onClose={() => setAiDialogOpen(false)}
                    onGenerate={handleAiGenerate}
                />
            </Box>
        </Container>
    );
};

export default AddProject;
