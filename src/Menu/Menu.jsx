import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Typography,
    Box,
    Switch,
    Divider,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Menu as MenuIcon } from "@mui/icons-material";

const Menu = ({ darkMode, toggleDarkMode }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const menuItems = [
        { label: "Home", path: "/" },
        { label: "Projects", path: "/projects" },
        { label: "Teams", path: "/team" },
        { label: "Sprints", path: "/sprints" },
        { label: "Issues", path: "/issues" },
    ];

    const drawer = (
        <Box sx={{ width: 250 }}>
            <Typography variant="h6" sx={{ p: 2 }}>
                Menu
            </Typography>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={item.path}
                            selected={location.pathname === item.path}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" sx={{ mb: 3 }}>
                <Toolbar>
                    {/* Mobile Menu Button */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ display: { xs: "block", md: "none" }, mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Logo */}
                    <Typography
                        variant="h6"
                        sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
                    >
                        Dashboard
                    </Typography>

                    {/* Desktop Menu */}
                    <Box sx={{ display: { xs: "none", md: "flex" } }}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.label}
                                component={RouterLink}
                                to={item.path}
                                color={location.pathname === item.path ? "secondary" : "inherit"}
                                sx={{ mx: 1 }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    {/* Dark Mode Toggle */}
                    <Box display="flex" alignItems="center" sx={{ ml: 2 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            Dark Mode
                        </Typography>
                        <Switch checked={darkMode} onChange={toggleDarkMode} />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                sx={{
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: 250,
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Menu;
