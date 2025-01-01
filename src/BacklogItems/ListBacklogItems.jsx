import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Grid,
    Alert,
} from '@mui/material';
import backlogItemService from '../service/BacklogItemService';

const ListBacklogItems = () => {
    const [backlogItems, setBacklogItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBacklogItems = async () => {
            try {
                setLoading(true);
                const response = await backlogItemService.getAll();
                setBacklogItems(response.data || []);
            } catch (err) {
                setError('Failed to fetch backlog items. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBacklogItems();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Backlog Items
            </Typography>
            <Grid container spacing={3}>
                {backlogItems?.length > 0 ? (
                    backlogItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {item.description || 'No description provided'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Type: {item.type}
                                    </Typography>
                                    <Typography variant="body2">
                                        Status: {item.status}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No backlog items found.
                    </Typography>
                )}
            </Grid>
        </Box>
    );
};

export default ListBacklogItems;
