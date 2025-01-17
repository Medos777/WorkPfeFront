import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TemplateService from '../service/TemplateService';

const EditTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    type: 'scrum',
    icon: 'speed',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id && id !== 'undefined') {
      loadTemplate();
    } else {
      navigate('/templates'); // Redirect to templates list if no valid ID
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      console.log('Loading template with ID:', id);
      const response = await TemplateService.getTemplate(id);
      console.log('Template data received:', response.data);
      if (response.data) {
        const templateData = response.data;
        setTemplate({
          name: templateData.name,
          description: templateData.description,
          type: templateData.type,
          icon: templateData.icon
        });
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setError(error.response?.data?.message || 'Failed to load template');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemplate(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!id) {
        setError('Template ID is missing');
        return;
      }
      await TemplateService.update(id, template);
      setSuccess('Template updated successfully');
      setTimeout(() => {
        navigate('/templates');
      }, 2000);
    } catch (error) {
      console.error('Error updating template:', error);
      setError(error.response?.data?.message || 'Failed to update template');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Template
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={template.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={template.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={template.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="scrum">Scrum Board</MenuItem>
              <MenuItem value="kanban">Kanban Board</MenuItem>
              <MenuItem value="project-management">Project Management</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Icon</InputLabel>
            <Select
              name="icon"
              value={template.icon}
              onChange={handleChange}
              required
            >
              <MenuItem value="speed">Speed</MenuItem>
              <MenuItem value="kanban">Kanban</MenuItem>
              <MenuItem value="project">Project</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              Update Template
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/templates')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default EditTemplate;
