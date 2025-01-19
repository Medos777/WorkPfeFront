import React, { useState } from 'react';
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
} from '@mui/material';
import {
    CloudDownload,
    Schedule,
    Description,
    PictureAsPdf,
    TableChart,
    Delete,
} from '@mui/icons-material';
import ReportService from '../../service/ReportService';

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
    const [scheduledReports, setScheduledReports] = useState([
        {
            id: 1,
            name: 'Weekly Progress Report',
            interval: 'weekly',
            format: 'pdf',
            nextRun: '2024-01-25',
        },
        {
            id: 2,
            name: 'Monthly Analytics',
            interval: 'monthly',
            format: 'excel',
            nextRun: '2024-02-01',
        },
    ]);

    const handleGenerateReport = async () => {
        if (!reportType || !format) {
            setNotification({
                open: true,
                message: 'Please select report type and format',
                severity: 'error',
            });
            return;
        }

        setLoading(true);
        try {
            await ReportService.exportProjectReport(reportType, format);
            setNotification({
                open: true,
                message: 'Report generated successfully',
                severity: 'success',
            });
        } catch (error) {
            setNotification({
                open: true,
                message: 'Error generating report',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleReport = async () => {
        if (!reportType || !scheduleInterval) {
            setNotification({
                open: true,
                message: 'Please select report type and schedule interval',
                severity: 'error',
            });
            return;
        }

        setLoading(true);
        try {
            await ReportService.scheduleReport(reportType, {
                interval: scheduleInterval,
                format,
            });
            setNotification({
                open: true,
                message: 'Report scheduled successfully',
                severity: 'success',
            });
        } catch (error) {
            setNotification({
                open: true,
                message: 'Error scheduling report',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteScheduledReport = (reportId) => {
        setScheduledReports(prev => prev.filter(report => report.id !== reportId));
        setNotification({
            open: true,
            message: 'Scheduled report deleted',
            severity: 'success',
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Reports
            </Typography>

            <Grid container spacing={3}>
                {/* Generate Report Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Generate Report
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Report Type</InputLabel>
                                    <Select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        label="Report Type"
                                    >
                                        <MenuItem value="project-progress">Project Progress</MenuItem>
                                        <MenuItem value="team-performance">Team Performance</MenuItem>
                                        <MenuItem value="resource-allocation">Resource Allocation</MenuItem>
                                        <MenuItem value="budget-analysis">Budget Analysis</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Format</InputLabel>
                                    <Select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        label="Format"
                                    >
                                        <MenuItem value="pdf">PDF</MenuItem>
                                        <MenuItem value="excel">Excel</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<CloudDownload />}
                                    onClick={handleGenerateReport}
                                    disabled={loading}
                                >
                                    Generate Report
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Schedule Report Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Schedule Report
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Report Type</InputLabel>
                                    <Select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        label="Report Type"
                                    >
                                        <MenuItem value="project-progress">Project Progress</MenuItem>
                                        <MenuItem value="team-performance">Team Performance</MenuItem>
                                        <MenuItem value="resource-allocation">Resource Allocation</MenuItem>
                                        <MenuItem value="budget-analysis">Budget Analysis</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Schedule Interval</InputLabel>
                                    <Select
                                        value={scheduleInterval}
                                        onChange={(e) => setScheduleInterval(e.target.value)}
                                        label="Schedule Interval"
                                    >
                                        <MenuItem value="daily">Daily</MenuItem>
                                        <MenuItem value="weekly">Weekly</MenuItem>
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<Schedule />}
                                    onClick={handleScheduleReport}
                                    disabled={loading}
                                >
                                    Schedule Report
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Scheduled Reports Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Scheduled Reports
                        </Typography>
                        <Grid container spacing={2}>
                            {scheduledReports.map((report) => (
                                <Grid item xs={12} sm={6} md={4} key={report.id}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="h6" component="div">
                                                    {report.name}
                                                </Typography>
                                                <Tooltip title="Delete Schedule">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteScheduledReport(report.id)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                            <Typography color="text.secondary">
                                                Interval: {report.interval}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Format: {report.format}
                                            </Typography>
                                            <Typography color="text.secondary">
                                                Next Run: {report.nextRun}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setNotification(prev => ({ ...prev, open: false }))}
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
