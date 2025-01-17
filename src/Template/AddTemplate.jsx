import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Button,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';
import TemplateService from '../service/TemplateService';

const AddTemplate = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const templates = [
    {
      id: 'kanban',
      name: 'Kanban',
      description: 'Visualize work and maximize efficiency with a kanban board',
      Icon: DashboardIcon,
    },
    {
      id: 'scrum',
      name: 'Scrum',
      description: 'Plan, prioritize, and schedule sprints using scrum framework',
      Icon: TimelineIcon,
    },
    {
      id: 'project',
      name: 'Project Management',
      description: 'Manage and track agile work plus integrate developer tools like GitHub',
      Icon: FolderIcon,
    },
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTemplateDescription(template.description);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !templateName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setSnackbar({
          open: true,
          message: 'User not authenticated. Please login again.',
          severity: 'error',
        });
        return;
      }

      const templateData = {
        name: templateName,
        description: templateDescription || selectedTemplate.description,
        type: selectedTemplate.id,
        icon: selectedTemplate.id === 'kanban' ? 'kanban' : 
              selectedTemplate.id === 'scrum' ? 'speed' : 'project',
        features: [],
        defaultColumns: [
          { name: 'To Do', order: 1, wipLimit: 0 },
          { name: 'In Progress', order: 2, wipLimit: 3 },
          { name: 'Done', order: 3, wipLimit: 0 }
        ],
        settings: {
          sprintDuration: 2
        },
        createdBy: userId
      };

      await TemplateService.create(templateData);
      setSnackbar({
        open: true,
        message: 'Template created successfully',
        severity: 'success',
      });
      
      setTimeout(() => {
        navigate('/templates');
      }, 1500);
    } catch (error) {
      console.error('Error creating template:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error creating template. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Choose a template
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Start with a template that fits your team's needs. You can customize it later.
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {templates.map((template) => {
            const IconComponent = template.Icon;
            return (
              <Grid item xs={12} md={4} key={template.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'grey.300',
                  }}
                >
                  <CardActionArea 
                    onClick={() => handleTemplateSelect(template)}
                    sx={{ height: '100%', p: 2 }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <IconComponent sx={{ fontSize: 40 }} />
                        <Typography variant="h6" component="div">
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          {template.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {selectedTemplate && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Template Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/templates')}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!selectedTemplate || !templateName.trim()}
          onClick={handleSubmit}
        >
          Create Template
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddTemplate;