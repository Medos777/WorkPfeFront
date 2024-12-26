import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Pagination,
    Modal,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Avatar,
    Switch,
    Tooltip,
} from "@mui/material";
import {
    Add as AddIcon,
    People as PeopleIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
} from "@mui/icons-material";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import TeamService from "../service/TeamService";
import UserService from "../service/UserService";
import ProjectService from "../service/ProjectService";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Constants
const ITEMS_PER_PAGE = 6;
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#d0ed57"];

// Theme configuration
const themeConfig = (darkMode) =>
    createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
        },
    });

const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [teams, setTeams] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsRes, membersRes, projectsRes] = await Promise.all([
                TeamService.getAll(),
                UserService.getUserByRole("developer"),
                ProjectService.getAll(),
            ]);
            setTeams(teamsRes.data);
            setTeamMembers(membersRes.data);
            setProjects(projectsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleTabChange = (event, newValue) => setSelectedTab(newValue);

    // Filtered teams and members
    const filteredTeams = teams.filter((team) =>
        team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredMembers = teamMembers.filter((member) =>
        member.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination for current tab
    const paginatedItems =
        selectedTab === 0
            ? filteredTeams.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
            )
            : filteredMembers.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
            );

    // Prepare data for charts
    const progressionChartData = projects.map((project) => ({
        name: project.projectName,
        Progress: Math.min(
            100,
            Math.max(
                0,
                ((Date.now() - new Date(project.startDate).getTime()) /
                    (new Date(project.endDate).getTime() -
                        new Date(project.startDate).getTime())) *
                100
            )
        ),
    }));

    const projectStatusData = [
        { name: "Completed", value: projects.filter((p) => p.status === "Completed").length },
        { name: "Ongoing", value: projects.filter((p) => p.status === "Ongoing").length },
        { name: "Upcoming", value: projects.filter((p) => p.status === "Upcoming").length },
    ];

    return (
        <ThemeProvider theme={themeConfig(darkMode)}>
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Dashboard</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                        <Typography>Dark Mode</Typography>
                    </Box>
                </Box>

                {/* Stats Section */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">Total Projects</Typography>
                            <Typography variant="h3">{projects.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">Total Teams</Typography>
                            <Typography variant="h3">{teams.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">Total Members</Typography>
                            <Typography variant="h3">{teamMembers.length}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Project Progression Chart */}
                <Box mt={4}>
                    <Typography variant="h6" mb={2}>
                        Project Progression
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={progressionChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip />
                            <Legend />
                            <Bar dataKey="Progress" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Additional Charts */}
                <Grid container spacing={3} mt={4}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" mb={2}>
                                Project Status Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={projectStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        label
                                    >
                                        {projectStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" mb={2}>
                                Project Completion Over Time
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={progressionChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <ChartTooltip />
                                    <Line type="monotone" dataKey="Progress" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Teams & Members Widget */}
                <Box mt={4}>
                    <Tabs value={selectedTab} onChange={handleTabChange}>
                        <Tab label="Teams" />
                        <Tab label="Members" />
                    </Tabs>
                    <Box mt={3}>
                        <Grid container spacing={3}>
                            {paginatedItems.map((item) => (
                                <Grid item xs={12} sm={6} md={4} key={item._id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                                                    {selectedTab === 0 ? <PeopleIcon /> : item.username.charAt(0)}
                                                </Avatar>
                                                <Typography variant="h6">
                                                    {selectedTab === 0 ? item.teamName : item.username}
                                                </Typography>
                                            </Box>
                                            <Typography>
                                                {selectedTab === 0
                                                    ? `Members: ${item.members?.length || 0}`
                                                    : `Role: ${item.role}`}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Pagination
                            count={Math.ceil(
                                (selectedTab === 0 ? filteredTeams : filteredMembers).length / ITEMS_PER_PAGE
                            )}
                            page={currentPage}
                            onChange={(_, page) => setCurrentPage(page)}
                            sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                        />
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Dashboard;
