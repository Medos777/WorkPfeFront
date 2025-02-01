import React from 'react';
import { useDrop } from 'react-dnd';
import { Paper, Typography, Box } from '@mui/material';
import EpicCard from './EpicCard';

const StatusColumn = ({ status, title, epics, onDrop, onEpicClick, onEditClick, onDeleteClick }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'epic',
        drop: (item) => onDrop(item.id, status),
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }));

    return (
        <Paper
            ref={drop}
            sx={{
                minWidth: 300,
                bgcolor: isOver ? '#f1f5f9' : '#fff',
                p: 2,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    color: '#1e293b',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                {title}
                <Typography
                    component="span"
                    sx={{
                        ml: 1,
                        fontSize: '0.875rem',
                        color: '#64748b',
                        bgcolor: '#f1f5f9',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '9999px'
                    }}
                >
                    {epics?.length || 0}
                </Typography>
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {epics?.map((epic) => (
                    <EpicCard
                        key={epic._id}
                        epic={epic}
                        onEpicClick={onEpicClick}
                        onEditClick={onEditClick}
                        onDeleteClick={onDeleteClick}
                    />
                ))}
            </Box>
        </Paper>
    );
};

export default StatusColumn;
