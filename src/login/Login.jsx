import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Link,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  FormHelperText,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import loginservice from '../service/LoginService';
import TeamService from '../service/TeamService';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/logo.svg';
import { Facebook, Google } from '@mui/icons-material';

const lightBlue = '#e3f2fd';
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
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

   useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            navigate('/teams');
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        setEmailError('');
        setPasswordError('');
        const login = { email, password }; // Changed login object structure
        loginservice.login(login)
            .then((res) => {
                localStorage.setItem('isLoggedIn', true);
                localStorage.setItem('token', res.data.token);
                const decodedToken = jwtDecode(res.data.token);
                const userId = decodedToken.userId;
                const role = decodedToken.role;
                localStorage.setItem('userId', userId);
                localStorage.setItem('role', role);
                setUserId(userId);

                // Fetch user's teams after successful login
                TeamService.getAll()
                    .then((teamsResponse) => {
                        const userTeams = teamsResponse.data.filter(
                            (team) => team.members && team.members.some((member) => member._id === userId)
                        );
                        localStorage.setItem('userTeams', JSON.stringify(userTeams.map((team) => team._id)));
                        // Refresh the page which will then redirect to dashboard
                        window.location.href = '/dashboard';
                    })
                    .catch((error) => {
                        console.error('Error fetching teams:', error);
                        // Even if teams fetch fails, refresh and redirect to dashboard
                        window.location.href = '/dashboard';
                    });
            })
            .catch((error) => {
                console.error('Login error:', error);
                 if (error.response && error.response.status === 401) {
                    setEmailError('Invalid email or username.');
                    setPasswordError('Incorrect password.');
                } else {
                     setEmailError("An unexpected error occurred")
                }
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
                justifyContent: 'center',
                 background: 'linear-gradient(to right, #6a51b7, #3e82c0)', 
                
                fontFamily: 'Roboto, sans-serif', // Modern font
            }}
        >
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        p: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: lightBlue, // Soft background color
                        borderRadius: 1,
                        boxShadow: 10,
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="TaskFlow Logo"
                        sx={{ height: 80, mb: 3 }} // Larger logo
                    />
                    <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#3f51b5', fontFamily: 'Roboto, sans-serif' }}>
                        Login
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2, // Gap between form elements
                        }}
                    >
                        <TextField
                            InputLabelProps={{
                                style: { fontWeight: 'bold' },
                            }}
                             sx={{ backgroundColor: "white" }}
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
                             error={Boolean(emailError)}
                                    helperText={emailError}
                                     sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 1, // Modern rounded corners
                                      },
                                    }}
                        />

                        <TextField
                          sx={{ backgroundColor: "white" }}
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
                                 error={Boolean(passwordError)}
                                 helperText={passwordError}
                                 sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1, // Modern rounded corners
                                    
                                  },
                                   "& .MuiFormHelperText-root": {
                                    marginRight:"10px"
                                },
                                 }}
                        />
                        {passwordError && <FormHelperText error>{passwordError}</FormHelperText>}

                        <Button
                            type="submit"
                            fullWidth
                            variant="outlined"
                            sx={{
                              py: 1.5,
                              borderRadius: 1, // Modern rounded corners
                              borderColor: '#3f51b5',
                              color: '#3f51b5',
                               ":hover":{
                                borderColor: '#3f51b5',
                                 backgroundColor:"#e8eaf6"
                               }
                            }}
                        >
                            Log In
                        </Button>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                            <IconButton
                              sx={{
                                backgroundColor: '#4267B2',
                                color: 'white',
                                ":hover": {
                                  backgroundColor: "#3b5998",
                                },
                                borderRadius: 1, // Modern rounded corners
                              }}
                            >
                              <Facebook />
                            </IconButton>
                            <IconButton
                              sx={{
                                backgroundColor: '#DB4437',
                                color: 'white',
                                ":hover": {
                                  backgroundColor: "#c53727",
                                },
                                borderRadius: 1, // Modern rounded corners
                              }}
                            >
                              <Google />
                            </IconButton>
                          </Box>
                        <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
                          Or Sign Up Using
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <Link
                                    href="#"
                                    variant="body2"
                                    sx={{
                                        color: '#3f51b5',
                                        textDecoration: 'none',
                                        ":hover": {
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
                                        color: '#3f51b5',
                                        textDecoration: 'none',
                                        ":hover": {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Don't have an account? Sign Up
                                </Link>
                            </Grid>                     
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
