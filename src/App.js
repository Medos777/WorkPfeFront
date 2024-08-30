//import logo from './logo.svg';
import './App.css';
import Menu from "./Menu/AppMenu";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./login/Login";

function App() {
  return (
      <Router>
        <Routes>
          {/* Define the route for the login page */}
          <Route path="/" element={<Login />} />
          {/* Define the route for the dashboard page */}
          <Route path="/dashboard" element={<Menu />} />
        </Routes>
      </Router>
  );
}

export default App;
