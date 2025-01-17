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
    CardActions,
    Button,
    Tabs,
    Tab,
    Avatar,
    Switch,
    Tooltip,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
} from "@mui/material";
import {
    Add as AddIcon,
    People as PeopleIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    MoreVert,
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
import SprintService from "../service/SprintService";
import BacklogService from "../service/BacklogService";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { format } from 'date-fns';
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";

// Constants
const ITEMS_PER_PAGE = 6;
const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"];

// Custom pie chart label
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0 ? (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{ fontSize: '12px', fontWeight: '500' }}
        >
            {`${name} (${value})`}
        </text>
    ) : null;
};

// Theme configuration
const themeConfig = (darkMode) =>
    createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
        },
    });

// Styled components
const StyledCard = styled(motion.div)(({ theme }) => ({
    height: '100%',
    '& .MuiCard-root': {
        height: '100%',
        background: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[10],
        }
    }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    background: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.primary.dark, 0.12)
        : alpha(theme.palette.primary.light, 0.12),
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)'
    }
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    background: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.8)
        : alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(8px)',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[4],
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        boxShadow: theme.shadows[8]
    }
}));

const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [teams, setTeams] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [backlogs, setBacklogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const navigate = useNavigate();

    // Fetch data on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamsRes, membersRes, projectsRes, sprintsRes, backlogsRes] = await Promise.all([
                TeamService.getAll(),
                UserService.getUserByRole("developer"),
                ProjectService.getAll(),
                SprintService.getAll(),
                BacklogService.getAll(),
            ]);
            setTeams(teamsRes.data);
            setTeamMembers(membersRes.data);
            setProjects(projectsRes.data);
            setSprints(sprintsRes.data);
            setBacklogs(backlogsRes.data);
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
        { 
            name: "Completed", 
            value: projects.filter(p => p.status === "Completed").length,
            color: COLORS[0]
        },
        { 
            name: "In Progress", 
            value: projects.filter(p => p.status === "In Progress").length,
            color: COLORS[1]
        },
        { 
            name: "On Hold", 
            value: projects.filter(p => p.status === "On Hold").length,
            color: COLORS[2]
        },
        { 
            name: "Cancelled", 
            value: projects.filter(p => p.status === "Cancelled").length,
            color: COLORS[3]
        }
    ].filter(item => item.value > 0);

    const sprintStatusData = [
        { name: "Completed", value: sprints.filter((s) => new Date(s.endDate) < new Date()).length },
        { name: "Ongoing", value: sprints.filter((s) => new Date(s.startDate) <= new Date() && new Date(s.endDate) >= new Date()).length },
        { name: "Upcoming", value: sprints.filter((s) => new Date(s.startDate) > new Date()).length },
    ];

    const backlogItemCount = backlogs.map((backlog) => ({
        name: backlog.name,
        items: backlog.items?.length || 0,
    }));

    const handleMenuOpen = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const handleEdit = () => {
        if (selectedTab === 0) {
            navigate(`/team/edit/${selectedItem._id}`);
        } else {
            navigate(`/user/edit/${selectedItem._id}`);
        }
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (selectedTab === 0) {
            // Handle team deletion
        } else {
            // Handle member deletion
        }
        handleMenuClose();
    };

    return (
        <ThemeProvider theme={themeConfig(darkMode)}>
            <Box 
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{ 
                    p: 3,
                    minHeight: '100vh',
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(45deg, #1a237e 0%, #121212 100%)'
                        : 'linear-gradient(45deg, #e3f2fd 0%, #ffffff 100%)'
                }}
            >
                {/* Header */}
                <Box 
                    component={motion.div}
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    mb={4}
                >
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700,
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'linear-gradient(45deg, #90caf9 0%, #64b5f6 100%)'
                                : 'linear-gradient(45deg, #1976d2 0%, #1565c0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Dashboard
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Switch 
                            checked={darkMode} 
                            onChange={() => setDarkMode(!darkMode)}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#90caf9'
                            }}}
                        />
                        <Typography>Dark Mode</Typography>
                    </Box>
                </Box>

                {/* Stats Section */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3} component={motion.div} whileHover={{ scale: 1.02 }}>
                        <StatsCard>
                            <Typography variant="h6" color="primary" gutterBottom>Total Projects</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>{projects.length}</Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} component={motion.div} whileHover={{ scale: 1.02 }}>
                        <StatsCard>
                            <Typography variant="h6" color="primary" gutterBottom>Total Teams</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>{teams.length}</Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} component={motion.div} whileHover={{ scale: 1.02 }}>
                        <StatsCard>
                            <Typography variant="h6" color="primary" gutterBottom>Total Members</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>{teamMembers.length}</Typography>
                        </StatsCard>
                    </Grid>
                </Grid>

                {/* Charts Section */}
                <Box mt={4}>
                    <ChartContainer>
                        <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                            Project Progression
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={progressionChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#ffffff20' : '#00000020'} />
                                <XAxis dataKey="name" stroke={darkMode ? '#ffffff80' : '#00000080'} />
                                <YAxis stroke={darkMode ? '#ffffff80' : '#00000080'} />
                                <ChartTooltip 
                                    contentStyle={{
                                        background: darkMode ? '#1a1a1a' : '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="Progress" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Box>

                {/* Additional Charts */}
                <Grid container spacing={3} mt={4}>
                    <Grid item xs={12} md={6}>
                        <ChartContainer>
                            <Box sx={{ position: 'relative' }}>
                                <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                                    Project Status Distribution
                                </Typography>
                                {projectStatusData.length === 0 ? (
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        height={300}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            No project data available
                                        </Typography>
                                    </Box>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={projectStatusData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={120}
                                                paddingAngle={2}
                                                labelLine={false}
                                                label={renderCustomizedLabel}
                                            >
                                                {projectStatusData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        stroke={darkMode ? '#121212' : '#ffffff'}
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: darkMode ? '#1a1a1a' : '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }}
                                                formatter={(value, name) => [
                                                    `${value} Project${value !== 1 ? 's' : ''}`,
                                                    name
                                                ]}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                content={({ payload }) => (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            flexWrap: 'wrap',
                                                            gap: 2,
                                                            mt: 2
                                                        }}
                                                    >
                                                        {payload.map((entry, index) => (
                                                            <Box
                                                                key={`legend-${index}`}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 12,
                                                                        height: 12,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: entry.color
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: darkMode ? '#ffffff' : '#000000'
                                                                    }}
                                                                >
                                                                    {entry.value}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                                {/* Total Projects Counter */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        sx={{ 
                                            fontWeight: 700,
                                            color: darkMode ? '#ffffff' : '#000000'
                                        }}
                                    >
                                        {projects.length}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ 
                                            color: darkMode ? '#ffffff80' : '#00000080'
                                        }}
                                    >
                                        Total Projects
                                    </Typography>
                                </Box>
                            </Box>
                        </ChartContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ChartContainer>
                            <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                                Project Completion Over Time
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={progressionChartData}>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke={darkMode ? '#ffffff20' : '#00000020'} 
                                    />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke={darkMode ? '#ffffff80' : '#00000080'}
                                    />
                                    <YAxis 
                                        stroke={darkMode ? '#ffffff80' : '#00000080'}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            background: darkMode ? '#1a1a1a' : '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        formatter={(value) => (
                                            <span style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Progress" 
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ 
                                            stroke: '#8884d8',
                                            strokeWidth: 2,
                                            r: 4,
                                            fill: darkMode ? '#1a1a1a' : '#ffffff'
                                        }}
                                        activeDot={{ 
                                            stroke: '#8884d8',
                                            strokeWidth: 2,
                                            r: 6,
                                            fill: darkMode ? '#1a1a1a' : '#ffffff'
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>
                </Grid>

                {/* Sprint and Backlog Charts */}
                <Grid container spacing={3} mt={4}>
                    <Grid item xs={12} md={6}>
                        <ChartContainer>
                            <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                                Sprint Status Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={sprintStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        label
                                    >
                                        {sprintStatusData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{
                                            background: darkMode ? '#1a1a1a' : '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        formatter={(value) => (
                                            <span style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ChartContainer>
                            <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                                Backlog Items per Backlog
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={backlogItemCount}>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke={darkMode ? '#ffffff20' : '#00000020'} 
                                    />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke={darkMode ? '#ffffff80' : '#00000080'}
                                    />
                                    <YAxis 
                                        stroke={darkMode ? '#ffffff80' : '#00000080'}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            background: darkMode ? '#1a1a1a' : '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        formatter={(value) => (
                                            <span style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                    <Bar 
                                        dataKey="items" 
                                        fill="#82ca9d" 
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>
                </Grid>

                {/* Teams & Members Widget */}
                <Box mt={4}>
                    <Box 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center" 
                        mb={3}
                        sx={{
                            background: (theme) => alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(8px)',
                            borderRadius: 2,
                            p: 2
                        }}
                    >
                        <Tabs 
                            value={selectedTab} 
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px'
                                },
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minWidth: 100
                                }
                            }}
                        >
                            <Tab label="Teams" />
                            <Tab label="Members" />
                        </Tabs>
                        <TextField
                            size="small"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{
                                ml: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    background: (theme) => alpha(theme.palette.background.paper, 0.8)
                                }
                            }}
                        />
                    </Box>
                    <Grid container spacing={3}>
                        {paginatedItems.map((item, index) => (
                            <Grid item xs={12} sm={6} md={4} key={item._id}>
                                <StyledCard
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: 'primary.main', 
                                                        mr: 2,
                                                        width: 56,
                                                        height: 56
                                                    }}
                                                >
                                                    {selectedTab === 0 ? <PeopleIcon /> : item.username.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        {selectedTab === 0 ? item.teamName : item.username}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedTab === 0
                                                            ? `${item.members?.length || 0} Members`
                                                            : `Role: ${item.role}`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                                            <IconButton 
                                                onClick={(e) => handleMenuOpen(e, item)}
                                                sx={{ 
                                                    '&:hover': {
                                                        background: (theme) => alpha(theme.palette.primary.main, 0.1)
                                                    }
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </StyledCard>
                            </Grid>
                        ))}
                    </Grid>
                    <Pagination
                        count={Math.ceil(
                            (selectedTab === 0 ? filteredTeams : filteredMembers).length / ITEMS_PER_PAGE
                        )}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        sx={{ 
                            mt: 4, 
                            display: 'flex', 
                            justifyContent: 'center',
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                </Box>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: (theme) => theme.shadows[8],
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            mx: 0.5,
                            my: 0.25
                        }
                    }
                }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>
        </ThemeProvider>
    );
};

export default Dashboard;
