import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Link,
    CssBaseline,
    Paper,
    Grid,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import loginservice from "../service/LoginService";
import TeamService from "../service/TeamService";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import logo from '../assets/logo.svg';

export { logout };

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
};

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            navigate("/teams");
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const login = { email, password };
        loginservice.login(login)
            .then((res) => {
                localStorage.setItem("isLoggedIn", true);
                localStorage.setItem("token", res.data.token);
                const decodedToken = jwtDecode(res.data.token);
                const userId = decodedToken.userId;
                const role = decodedToken.role;
                localStorage.setItem("userId", userId);
                localStorage.setItem("role", role);
                setUserId(userId);

                // Fetch user's teams after successful login
                TeamService.getAll()
                    .then((teamsResponse) => {
                        const userTeams = teamsResponse.data.filter(team => 
                            team.members && team.members.some(member => member._id === userId)
                        );
                        localStorage.setItem("userTeams", JSON.stringify(userTeams.map(team => team._id)));
                        navigate('/dashboard');
                    })
                    .catch((error) => {
                        console.error("Error fetching teams:", error);
                        navigate('/dashboard');
                    });
            })
            .catch((error) => {
                console.error("Login error:", error);
                toast.error("Invalid credentials. Please try again.");
            });
    };

    const handleSignUpClick = (event) => {
        event.preventDefault();
        navigate('/signup');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: 3,
            }}
        >
            <Container component="main" maxWidth="sm">
                <Paper
                    elevation={6}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 2,
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="TaskFlow Logo"
                        sx={{
                            height: 60,
                            mb: 4,
                        }}
                    />

                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ 
                            mb: 3,
                            color: '#1976d2',
                            fontWeight: 'bold',
                        }}
                    >
                        Welcome Back
                    </Typography>

                    <Box 
                        component="form" 
                        onSubmit={handleSubmit} 
                        sx={{ 
                            width: '100%',
                            mt: 1,
                        }}
                    >
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                            }}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                backgroundColor: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                                fontWeight: 'bold',
                            }}
                        >
                            Log In
                        </Button>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <Link 
                                    href="#" 
                                    variant="body2"
                                    sx={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                <Link
                                    href="#"
                                    onClick={handleSignUpClick}
                                    variant="body2"
                                    sx={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Don't have an account? Sign Up
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
            <ToastContainer position="top-right" autoClose={5000} />
        </Box>
    );
}
