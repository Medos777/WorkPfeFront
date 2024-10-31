import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Chip,
    Card,
    CardContent,
    Avatar,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    AssignmentTurnedIn as TaskIcon,
    TrendingUp as TrendingUpIcon,
    Notifications as NotificationsIcon,
    People as PeopleIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import TeamService from '../service/TeamService';
import UserService from '../service/UserService';
import ProjectService from '../service/ProjectService';

// Mock data for the chart
const performanceData = [
    { name: 'Jan', Completed: 4000, Pending: 2400 },
    { name: 'Feb', Completed: 3000, Pending: 1398 },
    { name: 'Mar', Completed: 2000, Pending: 9800 },
    { name: 'Apr', Completed: 2780, Pending: 3908 },
    { name: 'May', Completed: 1890, Pending: 4800 },
    { name: 'Jun', Completed: 2390, Pending: 3800 },
];

const Dashboard = () => {
    const [teams, setTeams] = useState([]);
    const [newTeam, setNewTeam] = useState({
        teamName: '',
        teamLead: '',
        members: [],
        projects: [],
    });
    const [teamLeads, setTeamLeads] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    const fetchData = async () => {
        try {
            const [teamsResponse, teamLeadsResponse, teamMembersResponse, projectsResponse] = await Promise.all([
                TeamService.getAll(),
                UserService.getUserByRole('manager'),
                UserService.getUserByRole('developer'),
                ProjectService.getAll(),
            ]);

            setTeams(teamsResponse.data);
            setTeamLeads(teamLeadsResponse.data);
            setTeamMembers(teamMembersResponse.data);
            setProjects(projectsResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTeam((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await TeamService.createTeam(newTeam);
            setNewTeam({
                teamName: '',
                teamLead: '',
                members: [],
                projects: [],
            });
            await fetchData();
            setOpenDialog(false);
        } catch (error) {
            console.error('Error creating team:', error);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                {/* Header */}
                <Grid item xs={12}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Project Dashboard
                    </Typography>
                </Grid>

                {/* Quick Stats */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" gutterBottom>
                            Total Projects
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {projects.length}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" gutterBottom>
                            Total Teams
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {teams.length}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" gutterBottom>
                            Team Members
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {teamMembers.length}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" gutterBottom>
                            Team Leads
                        </Typography>
                        <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {teamLeads.length}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Performance Chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Project Performance
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ChartTooltip />
                                <Legend />
                                <Bar dataKey="Completed" fill="#8884d8" />
                                <Bar dataKey="Pending" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Recent Activities */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activities
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <TaskIcon />
                                </ListItemIcon>
                                <ListItemText primary="Task 'Update UI' completed" secondary="2 hours ago" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <PeopleIcon />
                                </ListItemIcon>
                                <ListItemText primary="New team member added" secondary="5 hours ago" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <NotificationsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Project deadline reminder" secondary="1 day ago" />
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>

                {/* Team Members */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" gutterBottom>
                                Team Members
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleOpenDialog}
                            >
                                Add Team
                            </Button>
                        </Box>
                        <Grid container spacing={2}>
                            {teamMembers.map((member) => (
                                <Grid item xs={12} sm={6} md={3} key={member._id}>
                                    <Card>
                                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Avatar sx={{ width: 60, height: 60, mb: 2 }}>
                                                {member.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="subtitle1" gutterBottom>
                                                {member.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Role: {member.role}
                                            </Typography>
                                            <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                                                View Profile
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Team Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Team</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Team Name"
                            name="teamName"
                            value={newTeam.teamName}
                            onChange={handleInputChange}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        <FormControl variant="outlined" fullWidth margin="normal">
                            <InputLabel id="team-lead-label">Team Lead</InputLabel>
                            <Select
                                labelId="team-lead-label"
                                name="teamLead"
                                value={newTeam.teamLead}
                                onChange={handleInputChange}
                                label="Team Lead"
                            >
                                <MenuItem value="">Select a team lead</MenuItem>
                                {teamLeads.map((teamLead) => (
                                    <MenuItem key={teamLead._id} value={teamLead._id}>
                                        {teamLead.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" fullWidth margin="normal">
                            <InputLabel id="members-label">Members</InputLabel>
                            <Select
                                labelId="members-label"
                                name="members"
                                multiple
                                value={newTeam.members}
                                onChange={handleInputChange}
                                label="Members"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={teamMembers.find(member => member._id === value)?.username} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {teamMembers.map((member) => (
                                    <MenuItem key={member._id} value={member._id}>
                                        {member.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" fullWidth margin="normal">
                            <InputLabel id="projects-label">Projects</InputLabel>
                            <Select
                                labelId="projects-label"
                                name="projects"
                                multiple
                                value={newTeam.projects}
                                onChange={handleInputChange}
                                label="Projects"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={projects.find(project => project._id === value)?.ProjectName} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {projects.map((project) => (
                                    <MenuItem key={project._id} value={project._id}>
                                        {project.ProjectName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        Create Team
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;