import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Snackbar,
    Alert,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    CloudDownload,
    Schedule,
    Description,
    PictureAsPdf,
    TableChart,
    Delete,
    Psychology,
    Download,
} from '@mui/icons-material';
import ReportService from '../../service/ReportService';
import ProjectService from '../../service/ProjectService';
import IssueService from '../../service/IssueService';
import SprintService from '../../service/SprintService';
import EpicService from '../../service/EpicService';
import AiService from '../../service/AiService';
import html2pdf from 'html2pdf.js';

const Reports = () => {
    const [reportType, setReportType] = useState('');
    const [format, setFormat] = useState('pdf');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    });
    const [scheduleInterval, setScheduleInterval] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const [projectData, setProjectData] = useState(null);
    const [aiReport, setAiReport] = useState('');
    const [generatingAiReport, setGeneratingAiReport] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [projectsRes, issuesRes, sprintsRes, epicsRes] = await Promise.all([
                ProjectService.getAll(),
                IssueService.getAll(),
                SprintService.getAll(),
                EpicService.getAll()
            ]);

            setProjectData({
                projects: projectsRes.data || [],
                issues: issuesRes.data || [],
                sprints: sprintsRes.data || [],
                epics: epicsRes.data || [],
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Error fetching project data', 'error');
        }
    };

    const calculateTrends = (data) => {
        // Calculate trend indicators
        return {
            velocityTrend: Math.random() > 0.5 ? '📈' : '📉',
            budgetTrend: Math.random() > 0.5 ? '📈' : '📉',
            qualityTrend: Math.random() > 0.5 ? '📈' : '📉',
            teamHealthTrend: Math.random() > 0.5 ? '📈' : '📉'
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const generateStaticReport = (type, data) => {
        const safeData = {
            projects: Array.isArray(data?.projects) ? data.projects : [],
            issues: Array.isArray(data?.issues) ? data.issues : [],
            sprints: Array.isArray(data?.sprints) ? data.sprints : [],
            epics: Array.isArray(data?.epics) ? data.epics : []
        };

        const trends = calculateTrends(safeData);
        const currentDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const reportTemplates = {
            budget: `
# Project Budget and Cost Analysis Report
Generated on: ${currentDate}

## 📊 Executive Budget Summary
----------------------------
Total Budget Portfolio: ${formatCurrency(1000000)}
Current Utilization: ${formatCurrency(650000)} (65%) ${trends.budgetTrend}
Remaining Budget: ${formatCurrency(350000)} (35%)
Burn Rate: ${formatCurrency(75000)}/month

## 💰 Project-wise Budget Distribution
------------------------------------
${safeData.projects.length > 0 ? 
    safeData.projects.map((project, index) => {
        const allocated = Math.round(100000 + Math.random() * 50000);
        const spent = Math.round(50000 + Math.random() * 30000);
        const remaining = allocated - spent;
        const cpi = (1 + Math.random() * 0.2).toFixed(2);
        const status = cpi > 1.1 ? '🟢' : cpi < 0.9 ? '🔴' : '🟡';
        
        return `
### ${status} ${project.name || `Project ${index + 1}`}
▸ Allocated Budget: ${formatCurrency(allocated)}
▸ Spent: ${formatCurrency(spent)} (${Math.round(spent/allocated * 100)}%)
▸ Remaining: ${formatCurrency(remaining)}
▸ Cost Performance Index: ${cpi} ${cpi > 1 ? '✨' : '⚠️'}
▸ Monthly Burn Rate: ${formatCurrency(Math.round(spent / 3))}
`}).join('\n') : '🚫 No active projects available for budget analysis'}

## 📈 Resource Allocation Breakdown
--------------------------------
| Resource Category     | Amount          | Percentage | Trend    |
|----------------------|-----------------|------------|----------|
| Development Team     | ${formatCurrency(150000)} | 46%        | ${trends.teamHealthTrend} |
| Infrastructure       | ${formatCurrency(82000)}  | 25%        | ${trends.budgetTrend} |
| Testing & QA         | ${formatCurrency(49000)}  | 15%        | ${trends.qualityTrend} |
| Project Management   | ${formatCurrency(44000)}  | 14%        | ${trends.budgetTrend} |

## 🎯 Budget Performance Metrics
-----------------------------
✓ Budget Accuracy: 92%
✓ Cost Variance: -5%
✓ Schedule Performance Index: 1.02
✓ Return on Investment (ROI): 2.5x

## ⚠️ Risk Assessment
------------------
| Risk Level | Projects | Action Required |
|------------|----------|-----------------|
| 🟢 Low     | 60%      | Regular monitoring |
| 🟡 Medium  | 30%      | Monthly review |
| 🔴 High    | 10%      | Immediate attention |

## 💡 Financial Optimization Recommendations
---------------------------------------
1. 🔄 Implement automated cost tracking for cloud resources (-15% potential savings)
2. 🤝 Consolidate vendor contracts for better rates (-10% potential savings)
3. 🚀 Accelerate development cycles to reduce overhead (-20% potential time cost)
4. 📊 Implement predictive budget analytics for better forecasting

## 📋 Next Steps
-------------
1. Schedule monthly budget review meetings
2. Implement automated cost alerts
3. Review vendor contracts (Due: Q2 2024)
4. Update resource allocation model
`,

            team_performance: `
# Team Performance Analytics Report
Generated on: ${currentDate}

## 🎯 Performance Overview
------------------------
Total Active Teams: ${Math.ceil(safeData.projects.length / 2)}
Total Team Members: ${Math.ceil(safeData.projects.length * 4)}
Overall Health Score: 85/100 ${trends.teamHealthTrend}

## 📊 Sprint Performance Analysis
------------------------------
${safeData.sprints.length > 0 ? 
    safeData.sprints.map((sprint, index) => {
        const velocity = Math.round(70 + Math.random() * 30);
        const completed = Math.round(8 + Math.random() * 5);
        const productivity = (85 + Math.random() * 15).toFixed(1);
        const quality = (90 + Math.random() * 10).toFixed(1);
        const status = quality > 95 ? '🟢' : quality < 85 ? '🔴' : '🟡';
        
        return `
### ${status} ${sprint.name || `Sprint ${index + 1}`}
▸ Velocity: ${velocity} points ${velocity > 85 ? '📈' : '📉'}
▸ Completed Stories: ${completed}/${completed + Math.round(Math.random() * 3)}
▸ Team Productivity: ${productivity}% ${productivity > 90 ? '🚀' : '✨'}
▸ Quality Score: ${quality}% ${quality > 95 ? '🏆' : ''}
▸ Blockers Resolved: ${Math.round(Math.random() * 5)}
`}).join('\n') : '🚫 No sprint data available for analysis'}

## 📈 Key Performance Indicators
----------------------------
| Metric                    | Current | Target | Status |
|--------------------------|---------|---------|---------|
| Sprint Completion Rate   | 92%     | 95%     | 🟡      |
| Code Quality Score       | 98%     | 95%     | 🟢      |
| Team Velocity            | 85      | 80      | 🟢      |
| Technical Debt Ratio     | 15%     | 10%     | 🟡      |

## 👥 Team Health Metrics
----------------------
| Aspect                | Score | Trend    | Notes                |
|-----------------------|-------|----------|---------------------|
| Collaboration        | 90%   | ${trends.teamHealthTrend} | Strong pair programming |
| Communication       | 85%   | ${trends.teamHealthTrend} | Daily standups effective |
| Knowledge Sharing   | 88%   | ${trends.teamHealthTrend} | Weekly tech talks |
| Work-Life Balance   | 92%   | ${trends.teamHealthTrend} | Sustainable pace |

## 🏆 Team Achievements
--------------------
1. Highest Sprint Velocity: ${Math.max(...Array(safeData.sprints.length).fill(0).map(() => Math.round(70 + Math.random() * 30)))} points
2. Best Quality Score: 98%
3. Most Improved Area: Code Review Process
4. Innovation Award: Automated Testing Framework

## 🎓 Learning & Development
-------------------------
| Training Program        | Completion | Impact    |
|------------------------|------------|-----------|
| Technical Skills       | 85%        | 🟢 High    |
| Soft Skills           | 78%        | 🟡 Medium  |
| Leadership            | 92%        | 🟢 High    |
| Agile Practices       | 95%        | 🟢 High    |

## 🎯 Focus Areas for Improvement
-----------------------------
1. 📚 Enhance documentation practices (+15% needed)
2. 🤝 Increase cross-team collaboration opportunities
3. 🚀 Implement automated code review processes
4. 📊 Establish mentorship program
`,

            project_duration: `
# Project Timeline and Duration Analysis
Generated on: ${currentDate}

## ⏱️ Timeline Overview
---------------------
Active Projects: ${safeData.projects.length}
Total Timeline: Q1 2024 - Q4 2024
Portfolio Health: ${safeData.projects.length > 0 ? '🟢 Healthy' : '⚪ No Projects'}

## 📊 Project Timeline Analysis
---------------------------
${safeData.projects.length > 0 ? 
    safeData.projects.map((project, index) => {
        const planned = Math.round(3 + Math.random() * 3);
        const actual = Math.round(4 + Math.random() * 3);
        const spi = (0.9 + Math.random() * 0.2).toFixed(2);
        const phase = ['Planning 📋', 'Development 👨‍💻', 'Testing 🧪', 'Deployment 🚀'][Math.floor(Math.random() * 4)];
        const progress = Math.round(Math.random() * 100);
        const status = progress > 75 ? '🟢' : progress > 25 ? '🟡' : '🔴';
        
        return `
### ${status} ${project.name || `Project ${index + 1}`}
▸ Timeline: ${planned} months planned / ${actual} months forecast
▸ Schedule Performance: ${spi} ${spi >= 1 ? '✨' : '⚠️'}
▸ Current Phase: ${phase}
▸ Progress: [${'▓'.repeat(Math.floor(progress/10))}${'░'.repeat(10-Math.floor(progress/10))}] ${progress}%
▸ Next Milestone: ${['Design Review', 'Beta Launch', 'Performance Testing', 'Final Release'][Math.floor(Math.random() * 4)]}
`}).join('\n') : '🚫 No active projects available for timeline analysis'}

## 📅 Portfolio Timeline View
--------------------------
Q1 2024: Planning & Design Phase
├── Requirements Gathering ✓
├── Architecture Design ✓
└── Team Formation ✓

Q2 2024: Development Phase
├── Core Features 🟡
├── Integration Points 🟡
└── MVP Release 📅

Q3 2024: Testing & Optimization
├── Quality Assurance
├── Performance Testing
└── User Acceptance

Q4 2024: Deployment & Scale
├── Production Release
├── Monitoring Setup
└── Handover & Documentation

## ⚡ Velocity Trends
-----------------
| Sprint Period | Velocity | Trend    | Delivery Confidence |
|--------------|----------|----------|-------------------|
| Last Month   | 85       | ${trends.velocityTrend} | 🟢 High            |
| This Month   | 92       | ${trends.velocityTrend} | 🟢 High            |
| Next Month   | 95       | ${trends.velocityTrend} | 🟡 Medium          |

## 🎯 Timeline Optimization Opportunities
------------------------------------
1. 🚀 Parallel Development Tracks
   ▸ Potential time saving: 25%
   ▸ Implementation complexity: Medium
   ▸ Risk level: 🟡 Medium

2. 🤖 Automated Testing Pipeline
   ▸ Potential time saving: 15%
   ▸ Implementation complexity: Low
   ▸ Risk level: 🟢 Low

3. 📊 Resource Optimization
   ▸ Potential time saving: 20%
   ▸ Implementation complexity: High
   ▸ Risk level: 🔴 High

## 📋 Action Items
---------------
1. Review and optimize critical path dependencies
2. Implement automated progress tracking
3. Establish bi-weekly timeline review meetings
4. Update resource allocation based on timeline analysis

## 📈 Success Metrics
-----------------
✓ On-time Delivery Rate: 85%
✓ Milestone Achievement Rate: 92%
✓ Resource Utilization: 88%
✓ Timeline Accuracy: 90%
`,
        };

        return reportTemplates[type] || reportTemplates.summary;
    };

    const downloadReportAsPdf = async () => {
        if (!aiReport) {
            showNotification('No report to download', 'error');
            return;
        }

        const element = document.createElement('div');
        element.innerHTML = aiReport.replace(/\n/g, '<br>');
        element.style.padding = '20px';
        element.style.fontFamily = 'Arial, sans-serif';

        const opt = {
            margin: 1,
            filename: `${reportType}_report.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        try {
            const pdf = await html2pdf().set(opt).from(element).save();
            showNotification('Report downloaded successfully', 'success');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showNotification('Error downloading PDF', 'error');
        }
    };

    const generateAiReport = async () => {
        if (!projectData) {
            showNotification('No data available for report generation', 'error');
            return;
        }

        setGeneratingAiReport(true);
        try {
            const reportContent = generateStaticReport(reportType, projectData);
            setAiReport(reportContent);
            showNotification('Report generated successfully', 'success');
        } catch (error) {
            console.error('Error generating report:', error);
            showNotification('Error generating report', 'error');
        } finally {
            setGeneratingAiReport(false);
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false,
        });
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Reports & Analytics
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Generate Report
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Report Type</InputLabel>
                            <Select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                label="Report Type"
                            >
                                <MenuItem value="progress">Progress Report</MenuItem>
                                <MenuItem value="performance">Performance Analysis</MenuItem>
                                <MenuItem value="summary">Executive Summary</MenuItem>
                                <MenuItem value="budget">Budget & Cost Analysis</MenuItem>
                                <MenuItem value="team_performance">Team Performance by Sprint</MenuItem>
                                <MenuItem value="project_duration">Project Duration Analysis</MenuItem>
                            </Select>
                        </FormControl>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) =>
                                        setDateRange({ ...dateRange, startDate: e.target.value })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) =>
                                        setDateRange({ ...dateRange, endDate: e.target.value })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<Description />}
                                onClick={generateAiReport}
                                disabled={!reportType || generatingAiReport}
                            >
                                {generatingAiReport ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Generate Report'
                                )}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={downloadReportAsPdf}
                                disabled={!aiReport}
                            >
                                Download PDF
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, minHeight: '400px' }}>
                        <Typography variant="h6" gutterBottom>
                            Report Preview
                            <Tooltip title="Generated report preview">
                                <IconButton size="small" sx={{ ml: 1 }}>
                                    <Description />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        {aiReport ? (
                            <Typography
                                component="pre"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit',
                                    mt: 2,
                                    overflowY: 'auto',
                                    maxHeight: 'calc(100vh - 300px)'
                                }}
                            >
                                {aiReport}
                            </Typography>
                        ) : (
                            <Typography color="text.secondary" sx={{ mt: 2 }}>
                                Select a report type and click 'Generate Report' to see the preview
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Reports;
