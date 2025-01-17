import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Box,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import TemplateService from '../service/TemplateService';

const ListTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await TemplateService.getAll();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Handle error (show notification, etc.)
    }
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'kanban':
        return <DashboardIcon />;
      case 'scrum':
        return <TimelineIcon />;
      case 'project':
        return <FolderIcon />;
      default:
        return <DashboardIcon />;
    }
  };

  const getTemplateTypeLabel = (type) => {
    switch (type) {
      case 'kanban':
        return 'Kanban Board';
      case 'scrum':
        return 'Scrum Board';
      case 'project':
        return 'Project Management';
      default:
        return 'Template';
    }
  };

  const handleEdit = (id) => {
    navigate(`/templates/edit/${id}`);
  };

  const handleDeleteClick = (id) => {
    setSelectedTemplateId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await TemplateService.delete(selectedTemplateId);
      setDeleteDialogOpen(false);
      loadTemplates(); // Reload the list
    } catch (error) {
      console.error('Error deleting template:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleAddTemplate = () => {
    navigate('/templates/add');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Templates
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTemplate}
        >
          Add Template
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getTemplateIcon(template.type)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {template.name}
                  </Typography>
                </Box>
                
                <Chip 
                  label={getTemplateTypeLabel(template.type)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(template._id)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteClick(template._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListTemplate;