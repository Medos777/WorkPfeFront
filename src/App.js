//import logo from './logo.svg';
import './App.css';
import Menu from "./Menu/Menu";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./login/Login";
import Project from "./Project/AddProject";
import AddProject from "./Project/AddProject";
import ListProject from "./Project/ListProject";
import UpdateProject from "./Project/UpdateProject";
import SignUp from "./login/SignUp";
import TeamComponent from "./Team/TeamComponent";
import Dashboard from "./Dashboard/Dashboard";
import Layout from "./Menu/Layout";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme();

function App() {
  return (
      <ThemeProvider theme={theme}>
          <CssBaseline />
      <Router>
          <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
            {/* <Route path="/Menu" element={<Menu />} />*/}
          <Route path="/Addproject" element={<AddProject />} />
            <Route path="/projects/update/:projectId" element={<UpdateProject />} />

            <Route path="/project" element={<ListProject />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/team" element={<TeamComponent />} />
        </Routes>
          </Layout>
      </Router>
      </ThemeProvider>
  );
}

export default App;
