import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Button,
    Tooltip,
    IconButton,
    Chip,
} from '@mui/material';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    TrendingUp,
    Warning,
    CheckCircle,
    Info,
    Analytics,
    Timeline,
    Speed,
} from '@mui/icons-material';
import ProjectService from '../../service/ProjectService';
import ProjectAIService from '../../service/ProjectAIService';

const ProjectAnalytics = () => {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(true);
    const [projectData, setProjectData] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [riskAnalysis, setRiskAnalysis] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch real project data
                const projectStats = await ProjectService.getProjectAnalytics(projectId);
                setProjectData(projectStats);

                // Get AI-powered insights
                const insights = await ProjectAIService.getProjectInsights(projectId);
                setAiInsights(insights);

                // Get performance metrics
                const metrics = await ProjectService.getProjectPerformance(projectId);
                setPerformanceMetrics(metrics);

                // Get risk analysis
                const risks = await ProjectAIService.getProjectRisks(projectId);
                setRiskAnalysis(risks);

            } catch (error) {
                console.error('Error fetching project analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    const renderAIInsights = () => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI-Powered Insights
                </Typography>
                {aiInsights?.recommendations.map((insight, index) => (
                    <Box key={index} sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
                        <Info color="primary" sx={{ mr: 1, mt: 0.5 }} />
                        <Box>
                            <Typography variant="subtitle1">{insight.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {insight.description}
                            </Typography>
                            {insight.impact && (
                                <Chip
                                    size="small"
                                    label={`Impact: ${insight.impact}`}
                                    color={insight.impact === 'High' ? 'error' : 'warning'}
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Box>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );

    const renderPerformanceMetrics = () => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Performance Metrics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceMetrics?.timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="velocity" stroke="#8884d8" name="Team Velocity" />
                        <Line type="monotone" dataKey="completion" stroke="#82ca9d" name="Completion Rate" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

    const renderRiskAnalysis = () => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Risk Analysis
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={riskAnalysis?.riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="category"
                                    label
                                >
                                    {riskAnalysis?.riskDistribution.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box>
                            {riskAnalysis?.topRisks.map((risk, index) => (
                                <Box key={index} sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2">
                                        {risk.category}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {risk.description}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={`Probability: ${risk.probability}%`}
                                        color={risk.probability > 70 ? 'error' : 'warning'}
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    const renderProgressMetrics = () => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Progress Metrics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectData?.progressMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sprint" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Bar dataKey="planned" fill="#8884d8" name="Planned" />
                        <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Project Analytics Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Sprint Velocity</Typography>
                        <Typography variant="h4" color="primary">
                            {performanceMetrics?.currentVelocity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Points per Sprint
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Completion Rate</Typography>
                        <Typography variant="h4" color="success.main">
                            {performanceMetrics?.completionRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Tasks Completed
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">Risk Level</Typography>
                        <Typography variant="h4" color={riskAnalysis?.overallRisk > 70 ? 'error.main' : 'warning.main'}>
                            {riskAnalysis?.overallRisk}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Overall Risk Score
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">AI Confidence</Typography>
                        <Typography variant="h4" color="info.main">
                            {aiInsights?.confidenceScore}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Prediction Accuracy
                        </Typography>
                    </Paper>
                </Grid>

                {/* AI Insights */}
                <Grid item xs={12} md={6}>
                    {renderAIInsights()}
                </Grid>

                {/* Performance Metrics */}
                <Grid item xs={12} md={6}>
                    {renderPerformanceMetrics()}
                </Grid>

                {/* Risk Analysis */}
                <Grid item xs={12} md={6}>
                    {renderRiskAnalysis()}
                </Grid>

                {/* Progress Metrics */}
                <Grid item xs={12} md={6}>
                    {renderProgressMetrics()}
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProjectAnalytics;
