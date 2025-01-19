import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ProjectAIService {
    async getProjectInsights(projectId) {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/ai/insights`);
            return response.data;
        } catch (error) {
            // For demo purposes, return mock data
            return {
                recommendations: [
                    {
                        title: 'Resource Optimization',
                        description: 'Based on historical data, team velocity could be improved by 25% by redistributing tasks according to skill sets.',
                        impact: 'High'
                    },
                    {
                        title: 'Sprint Planning',
                        description: 'Current sprint capacity is underutilized. Consider increasing story points by 15% in next sprint.',
                        impact: 'Medium'
                    },
                    {
                        title: 'Risk Mitigation',
                        description: 'Dependencies in upcoming tasks suggest potential bottlenecks. Consider parallel development tracks.',
                        impact: 'High'
                    }
                ],
                confidenceScore: 85
            };
        }
    }

    async getProjectRisks(projectId) {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/ai/risks`);
            return response.data;
        } catch (error) {
            // For demo purposes, return mock data
            return {
                overallRisk: 65,
                riskDistribution: [
                    { category: 'Technical', value: 30 },
                    { category: 'Schedule', value: 25 },
                    { category: 'Resource', value: 20 },
                    { category: 'Scope', value: 15 },
                    { category: 'Budget', value: 10 }
                ],
                topRisks: [
                    {
                        category: 'Technical Debt',
                        description: 'Current code complexity trends indicate increasing maintenance costs',
                        probability: 75
                    },
                    {
                        category: 'Resource Availability',
                        description: 'Key team members have overlapping commitments in upcoming sprints',
                        probability: 60
                    },
                    {
                        category: 'Schedule Delay',
                        description: 'Integration testing phase may require additional time based on complexity',
                        probability: 45
                    }
                ]
            };
        }
    }

    async predictProjectSuccess(projectId) {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/ai/prediction`);
            return response.data;
        } catch (error) {
            // For demo purposes, return mock data
            return {
                successProbability: 78,
                factors: [
                    {
                        name: 'Team Experience',
                        impact: 'positive',
                        weight: 0.8
                    },
                    {
                        name: 'Technical Complexity',
                        impact: 'negative',
                        weight: 0.6
                    },
                    {
                        name: 'Resource Allocation',
                        impact: 'neutral',
                        weight: 0.4
                    }
                ],
                recommendations: [
                    'Consider adding more experienced developers to complex tasks',
                    'Implement more automated testing to reduce technical risks',
                    'Review and optimize resource allocation strategy'
                ]
            };
        }
    }

    async analyzeTrends(projectId) {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}/ai/trends`);
            return response.data;
        } catch (error) {
            // For demo purposes, return mock data
            return {
                velocityTrend: {
                    current: 25,
                    historical: [20, 22, 24, 25, 23, 25],
                    prediction: 27
                },
                qualityMetrics: {
                    bugRate: {
                        current: 2.5,
                        trend: 'decreasing'
                    },
                    codeQuality: {
                        current: 85,
                        trend: 'stable'
                    },
                    testCoverage: {
                        current: 78,
                        trend: 'increasing'
                    }
                },
                teamHealth: {
                    productivity: {
                        score: 85,
                        trend: 'improving'
                    },
                    collaboration: {
                        score: 90,
                        trend: 'stable'
                    },
                    satisfaction: {
                        score: 82,
                        trend: 'stable'
                    }
                }
            };
        }
    }
}

export default new ProjectAIService();
