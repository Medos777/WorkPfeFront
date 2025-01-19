import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    CardHeader,
    Divider,
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const TeamAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [teamData, setTeamData] = useState({
        performanceData: [],
        productivityData: [],
        taskDistribution: [],
    });

    useEffect(() => {
        // Simulated data - replace with actual API calls
        const fetchData = async () => {
            try {
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                setTeamData({
                    performanceData: [
                        { month: 'Jan', completed: 65, planned: 80 },
                        { month: 'Feb', completed: 75, planned: 70 },
                        { month: 'Mar', completed: 85, planned: 80 },
                        { month: 'Apr', completed: 80, planned: 85 },
                    ],
                    productivityData: [
                        { team: 'Team A', productivity: 85 },
                        { team: 'Team B', productivity: 75 },
                        { team: 'Team C', productivity: 90 },
                        { team: 'Team D', productivity: 70 },
                    ],
                    taskDistribution: [
                        { name: 'Completed', value: 400 },
                        { name: 'In Progress', value: 300 },
                        { name: 'Pending', value: 200 },
                        { name: 'Blocked', value: 100 },
                    ],
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching team analytics:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Team Analytics
            </Typography>

            <Grid container spacing={3}>
                {/* Team Performance Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Team Performance
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={teamData.performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="completed" stroke="#8884d8" name="Completed Tasks" />
                                <Line type="monotone" dataKey="planned" stroke="#82ca9d" name="Planned Tasks" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Team Productivity Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Team Productivity
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={teamData.productivityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="team" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="productivity" fill="#8884d8" name="Productivity Score" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Task Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Task Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={teamData.taskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {teamData.taskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Team Statistics */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Team Statistics
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { title: 'Average Completion Rate', value: '85%' },
                                { title: 'On-time Delivery', value: '92%' },
                                { title: 'Team Efficiency', value: '88%' },
                                { title: 'Sprint Success Rate', value: '90%' },
                            ].map((stat, index) => (
                                <Grid item xs={6} key={index}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="textSecondary" gutterBottom>
                                                {stat.title}
                                            </Typography>
                                            <Typography variant="h4">
                                                {stat.value}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeamAnalytics;
