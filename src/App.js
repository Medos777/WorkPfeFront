import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './Menu/Layout';
import AuthGuard from "./Auth/AuthGuard";
import UserDetails from './login/UserDetailes';

const Login = lazy(() => import('./login/Login'));
const SignUp = lazy(() => import('./login/SignUp'));
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const AddProject = lazy(() => import('./Project/AddProject'));
const UpdateProject = lazy(() => import('./Project/UpdateProject'));
const ListProject = lazy(() => import('./Project/ListProject'));
const ProjectDetails = lazy(() => import('./Project/ProjectDetails'));
const AiProjectCreation = lazy(() => import('./Project/AiProjectCreation'));
const TeamComponent = lazy(() => import('./Team/TeamComponent'));
const IssueList = lazy(() => import('./Issue/IssueList'));
const AddIssue = lazy(() => import('./Issue/AddIssue'));
const SprintList = lazy(() => import('./Sprint/SprintList'));
const ListBacklog = lazy(() => import('./Backlog/ListBacklog'));
const AddBacklog = lazy(() => import('./Backlog/AddBacklog'));
const ListBacklogItems = lazy(() => import('./BacklogItems/ListBacklogItems'));
const BacklogItems = lazy(() => import('./BacklogItems/BacklogItems'));
const AddTemplate = lazy(() => import('./Template/AddTemplate'));
const EditTemplate = lazy(() => import('./Template/EditTemplate'));
const ListTemplate = lazy(() => import('./Template/ListTemplate'));
const AddEpic = lazy(() => import('./Epic/AddEpic'));
const EpicList = lazy(() => import('./Epic/EpicList'));
const ProjectAnalytics = lazy(() => import('./components/Dashboard/ProjectAnalytics'));
const ProjectChat = lazy(() => import('./components/Collaboration/ProjectChat'));
const TeamAnalytics = lazy(() => import('./components/Analytics/TeamAnalytics'));
const Reports = lazy(() => import('./components/Reports/Reports'));

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
                            />
                            <Route
                                path="/backlog"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ListBacklog/>
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/backlog/add"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AddBacklog/>
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/backlogItemsTest"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ListBacklogItems/>
                                    </AuthGuard>
                                }
                            />
                            <Route
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
                                path="/projects/ai-create"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AiProjectCreation />
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
                                path="/projects/:id"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ProjectDetails />
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
                            {/* Issue Routes */}
                            <Route
                                path="/issues"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <IssueList />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/issues/add"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AddIssue />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects/:projectId/issues"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <IssueList />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects/:projectId/issues/add"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AddIssue />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/user/details"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <UserDetails />
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
                                path="/templates"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ListTemplate />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/templates/add"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AddTemplate />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/templates/edit/:id"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <EditTemplate />
                                    </AuthGuard>
                                }
                            />
                            {/* Epic Routes */}
                            <Route
                                path="/epics"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <EpicList />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects/:projectId/epics"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <EpicList />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects/:projectId/epics/add"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <AddEpic />
                                    </AuthGuard>
                                }
                            />
                            {/* Analytics Routes */}
                            <Route
                                path="/projects/analytics"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ProjectAnalytics />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/teams/analytics"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <TeamAnalytics />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/reports"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <Reports />
                                    </AuthGuard>
                                }
                            />
                            <Route
                                path="/projects/:projectId/analytics"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ProjectAnalytics />
                                    </AuthGuard>
                                }
                            />
                            {/* Project Chat Route */}
                            <Route
                                path="/projects/:projectId/chat"
                                element={
                                    <AuthGuard isLoggedIn={isLoggedIn}>
                                        <ProjectChat currentUser={{ id: localStorage.getItem('userId') }} />
                                    </AuthGuard>
                                }
                            />
                            <Route path="/project/:projectId/epics" element={
                                <AuthGuard>
                                    <Layout>
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <EpicList />
                                        </Suspense>
                                    </Layout>
                                </AuthGuard>
                            } />
                            <Route path="/project/:projectId/issues" element={
                                <AuthGuard>
                                    <Layout>
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <IssueList />
                                        </Suspense>
                                    </Layout>
                                </AuthGuard>
                            } />
                            <Route path="/project/:projectId/backlog" element={
                                <AuthGuard>
                                    <Layout>
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <ListBacklog />
                                        </Suspense>
                                    </Layout>
                                </AuthGuard>
                            } />
                            {/* Default Route */}
                            <Route
                                path="/"
                                element={
                                    isLoggedIn ? (
                                        <Navigate to="/dashboard" replace />
                                    ) : (
                                        <Navigate to="/login" replace />
                                    )
                                }
                            />
                        </Routes>
                    </Suspense>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;