import React from 'react';
import { useDrag } from 'react-dnd';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const EpicCard = ({ epic, onEpicClick, onEditClick, onDeleteClick }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'epic',
        item: { id: epic._id, status: epic.status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }));

    return (
        <Card 
            ref={drag}
            sx={{ 
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                '&:hover': {
                    boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
                }
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {epic.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip 
                        label={epic.status || 'To Do'} 
                        size="small"
                        sx={{ 
                            bgcolor: 
                                epic.status === 'done' ? '#10b981' :
                                epic.status === 'in progress' ? '#3b82f6' : '#e2e8f0',
                            color: epic.status === 'to do' ? '#1e293b' : 'white'
                        }}
                    />
                    <Chip 
                        label={epic.priority || 'Medium'} 
                        size="small"
                        sx={{ bgcolor: '#e2e8f0', color: '#1e293b' }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {epic.description || 'No description'}
                </Typography>
            </CardContent>
            <CardActions>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Tooltip title="View Details">
                        <IconButton 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEpicClick(epic);
                            }}
                            sx={{ color: '#1e40af' }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Epic">
                        <IconButton 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(epic);
                            }}
                            sx={{ color: '#64748b' }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Epic">
                        <IconButton 
                            size="small" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(epic._id);
                            }}
                            sx={{ color: '#ef4444' }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </CardActions>
        </Card>
    );
};

export default EpicCard;
