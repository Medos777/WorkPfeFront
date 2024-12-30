import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './Menu/Layout';
import AuthGuard from "./Auth/AuthGuard";

const Login = lazy(() => import('./login/Login'));
const SignUp = lazy(() => import('./login/SignUp'));
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const AddProject = lazy(() => import('./Project/AddProject'));
const UpdateProject = lazy(() => import('./Project/UpdateProject'));
const ListProject = lazy(() => import('./Project/ListProject'));
const TeamComponent = lazy(() => import('./Team/TeamComponent'));
const IssueList = lazy(() => import('./Issue/IssueList'));
const SprintList = lazy(() => import('./Sprint/SprintList'));
const ListBacklog = lazy(() => import('./Backlog/ListBacklog'));
const AddBacklog = lazy(() => import('./Backlog/AddBacklog'));
const BacklogItems = lazy(() => import('./BacklogItems/BacklogItems'));

const theme = createTheme({
    palette: {
        mode: 'light',
    },
});

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedInStatus = localStorage.getItem("isLoggedIn");
        setIsLoggedIn(!!loggedInStatus);
    }, []);

    const handleLogin = () => {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Layout isLoggedIn={isLoggedIn}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login onLogin={handleLogin} />} />
                            <Route path="/signup" element={<SignUp />} />

                            {/* Private Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <Dashboard onLogout={handleLogout} />
                                    </AuthGuard>
                                }
                            /><Route
                                path="/backlog"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ListBacklog/>
                                    </AuthGuard>
                                }
                            /><Route
                                path="/backlog/add"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AddBacklog/>
                                    </AuthGuard>
                                }
                            /><Route
                                path="/backlogItems"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <BacklogItems/>
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects/add"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AddProject />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects/update/:projectId"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <UpdateProject />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ListProject />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/team"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <TeamComponent />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/issues"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <IssueList />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/sprints"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <SprintList />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/"
                                element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
                            />
                        </Routes>
                    </Suspense>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
