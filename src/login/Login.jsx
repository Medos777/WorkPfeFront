import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Link, CssBaseline, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import loginservice from "../service/LoginService";

import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // Correct way to import

export default function Login() {
    const navigate = useNavigate();

    // State for email, password, and role
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState("");
    const [login, setLogin] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSignUpClick = (event) => {
        event.preventDefault();
        navigate('/signup');
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log({ email, password, role });
        const login = {email,password,role};
        loginservice.login(login)
            .then((res) => {
                console.log("avec succee");
                console.log(login);
                console.log(res.data);
                localStorage.setItem("isLoggedIn", true);
                console.log(localStorage)
                localStorage.setItem("token", res.data.token);
                const decodedToken = jwtDecode(res.data.token);
                console.log("Decoded Token:", decodedToken);
                const userEmail = decodedToken.UserEmail;
                const userId = decodedToken.userId;
                const role = decodedToken.role;
                console.log(userId);
                localStorage.getItem("userId",userId);
                console.log(userEmail);
                setUserId(decodedToken.userId);
                console.log(userId);
                localStorage.setItem("userId", userId);
                setUserId(decodedToken.userId);
                localStorage.setItem("role",role);
                console.log(userId);
        navigate('/dashboard');
            })
            .catch((error) => {
                console.log("erreur", error);
            });
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
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    Log in to your account
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />


                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role"
                            value={role}
                            label="Role"
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="manager">Manager</MenuItem>
                            <MenuItem value="developer">Developer</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Log In
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Link href="#" variant="body2">
                            Forgot password?
                        </Link>
                        <Link href="#" onClick={handleSignUpClick} variant="body2">
                            Sign Up
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}
