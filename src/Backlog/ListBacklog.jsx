import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
} from '@mui/material';
import AddBacklog from './AddBacklog';
import backlogService from '../service/BacklogService';

const ListBacklog = () => {
    const [backlogs, setBacklogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchBacklogs = async () => {
        try {
            setLoading(true);
            const response = await backlogService.getAll();
            setBacklogs(response.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch backlogs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBacklogs();
    }, []);

    const handleBacklogCreated = () => {
        fetchBacklogs();
    };

    const paginatedBacklogs = backlogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Backlogs</Typography>
                <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ fontWeight: 'bold' }}>
                    Add Backlog
                </Button>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {paginatedBacklogs.map((backlog) => (
                            <Grid item xs={12} sm={12} md={6} key={backlog._id}>
                                <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {backlog.name}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            Project: {backlog.project?.projectName || 'N/A'}
                                        </Typography>
                                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {backlog.items.length > 0 ? (
                                                        backlog.items.map((item, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>{index + 1}</TableCell>
                                                                <TableCell>{item}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={2} align="center">
                                                                No items available
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination
                            count={Math.ceil(backlogs.length / itemsPerPage)}
                            page={currentPage}
                            onChange={(_, page) => setCurrentPage(page)}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </>
            )}
            <AddBacklog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onBacklogCreated={handleBacklogCreated}
            />
        </Box>
    );
};

export default ListBacklog;
