//import logo from './logo.svg';
import './App.css';
import Menu from "./Menu/AppMenu";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./login/Login";
import Project from "./Project/AddProject";
import AddProject from "./Project/AddProject";
import ListProject from "./Project/ListProject";
import UpdateProject from "./Project/UpdateProject";
import SignUp from "./login/SignUp";

function App() {
  return (
      <Router>
        <Routes>
          {/* Define the route for the login page */}
          <Route path="/" element={<Login />} />
          {/* Define the route for the dashboard page */}
          <Route path="/Menu" element={<Menu />} />
          <Route path="/Addproject" element={<AddProject />} />
            <Route path="/projects/update/:projectId" element={<UpdateProject />} />

            <Route path="/project" element={<ListProject />} />
            <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
  );
}

export default App;
