import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Grid,
    InputAdornment,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CssBaseline,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import userservice from "../service/UserService";
import {useNavigate} from "react-router-dom";


export default function SignUp() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [adresse, setAdresse] = useState('');  // New address state
    const [tel, setTel] = useState('');
    const [role, setRole] = useState('');
            // New telephone state

    // Handle input changes
    const handleEmailChange = (event) => setEmail(event.target.value);
    const handleUsernameChange = (event) => setUsername(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);
    const handleConfirmPasswordChange = (event) => setConfirmPassword(event.target.value);
    const handleRoleChange = (event) => setRole(event.target.value);
    const handleAddressChange = (event) => setAdresse(event.target.value); // Address handler
    const handleTelChange = (event) => setTel(event.target.value);         // Tel handler

    // Toggle password visibility
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = (event) => event.preventDefault();

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();

        const user = {
            username,
            email,
            password,
            adresse,
            tel,
            role,

        };

        console.log(user);
        userservice.create(user);
        navigate('/project');
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign Up for WorkProject
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        {/* Email field */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                label="username"
                                name="username"
                                autoComplete="username"
                                value={username}
                                onChange={handleUsernameChange}
                            />
                        </Grid><Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </Grid>

                        {/* Password field */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={handlePasswordChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Confirm Password field */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                id="confirm-password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                        </Grid>

                        {/* Address field */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="adresse"
                                label="Address"
                                id="adresse"
                                autoComplete="adresse"
                                value={adresse}
                                onChange={handleAddressChange}  // Address input handler
                            />
                        </Grid>

                        {/* Telephone field */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                name="tel"
                                label="Telephone"
                                id="tel"
                                autoComplete="tel"
                                value={tel}
                                onChange={handleTelChange}  // Tel input handler
                            />
                        </Grid>

                        {/* Role dropdown */}
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel id="role-label">Role</InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="role"
                                    value={role}
                                    label="Role"
                                    onChange={handleRoleChange}
                                >
                                    <MenuItem value="developer">Developer</MenuItem>
                                    <MenuItem value="manager">Manager</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
