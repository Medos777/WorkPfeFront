import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Alert, Button, Card, CardContent, CardHeader, Typography, CardActions } from '@mui/material';
import sprintService from '../service/SprintService';
import 'bootstrap/dist/css/bootstrap.min.css';

const SprintList = () => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSprints, setExpandedSprints] = useState(new Set());

    useEffect(() => {
        loadSprints();
    }, []);

    const loadSprints = async () => {
        try {
            setLoading(true);
            const response = await sprintService.getAll();
            const sprintsData = Array.isArray(response.data) ? response.data : response?.sprints || [];
            setSprints(sprintsData);
            setError(null);
        } catch (err) {
            setError(err.message);
            setSprints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSprint = async () => {
        try {
            const newSprint = {
                name: `Sprint ${sprints.length + 1}`,
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'PLANNING',
            };
            await sprintService.create(newSprint);
            loadSprints(); // Refresh the list after creating a new sprint
        } catch (err) {
            setError(err.message);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-info text-white';
            case 'PLANNING':
                return 'bg-warning text-dark';
            case 'COMPLETED':
                return 'bg-success text-white';
            default:
                return 'bg-secondary text-white';
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            {error && (
                <Alert severity="error" className="mb-4">
                    {error}
                </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4">Sprints</h1>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateSprint}
                    startIcon={<Plus />}
                >
                    Create Sprint
                </Button>
            </div>

            <div className="row">
                {sprints.map((sprint) => (
                    <div className="col-md-6 mb-4" key={sprint._id}>
                        <Card className="shadow-sm">
                            <CardHeader
                                className={`d-flex justify-content-between align-items-center ${getStatusStyles(sprint.status)}`}
                            >
                                <Typography variant="h6" className="mb-0 text-white">
                                    {sprint.name}
                                </Typography>
                                <button
                                    className="btn btn-link text-white"
                                    onClick={() => setExpandedSprints(prev => {
                                        const newSet = new Set(prev);
                                        prev.has(sprint._id) ? newSet.delete(sprint._id) : newSet.add(sprint._id);
                                        return newSet;
                                    })}
                                >
                                    {expandedSprints.has(sprint._id) ? <ChevronDown /> : <ChevronRight />}
                                </button>
                            </CardHeader>

                            <CardContent>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">
                                        <Calendar className="me-1" />
                                        {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                    </span>
                                    <span className="text-muted">
                                        <Clock className="me-1" />
                                        {Math.ceil((new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                </div>
                            </CardContent>

                            {expandedSprints.has(sprint._id) && (
                                <CardActions>
                                    <div className="text-center text-muted">
                                        No issues assigned to this sprint yet
                                    </div>
                                </CardActions>
                            )}
                        </Card>
                    </div>
                ))}

                {sprints.length === 0 && (
                    <div className="col text-center">
                        <div className="rounded-circle bg-light p-4 mb-4">
                            <Calendar className="h2 text-secondary" />
                        </div>
                        <h3 className="h5">No sprints found</h3>
                        <p className="text-muted">
                            Get started by creating a new sprint for your project.
                        </p>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateSprint}
                            startIcon={<Plus />}
                        >
                            Create Sprint
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SprintList;
