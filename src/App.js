import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './Menu/Layout';

const Login = lazy(() => import('./login/Login'));
const SignUp = lazy(() => import('./login/SignUp'));
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const AddProject = lazy(() => import('./Project/AddProject'));
const UpdateProject = lazy(() => import('./Project/UpdateProject'));
const ListProject = lazy(() => import('./Project/ListProject'));
const TeamComponent = lazy(() => import('./Team/TeamComponent'));
const IssueList = lazy(() => import('./Issue/IssueList'));
const SprintList = lazy(() => import('./Sprint/SprintList'));

const theme = createTheme({
    palette: {
        mode: 'light', // or 'dark'
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Layout>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/projects/add" element={<AddProject />} />
                            <Route path="/projects/update/:projectId" element={<UpdateProject />} />
                            <Route path="/projects" element={<ListProject />} />
                            <Route path="/team" element={<TeamComponent />} />
                            <Route path="/issues" element={<IssueList />} />
                            <Route path="/sprints" element={<SprintList />} />
                        </Routes>
                    </Suspense>
                </Layout>
            </Router>
        </ThemeProvider>
    );
}

export default App;
