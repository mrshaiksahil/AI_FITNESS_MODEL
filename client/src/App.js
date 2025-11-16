import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Auth Components
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Main Components
import Home from './components/Home/Home';
import ExerciseAI from './components/ExerciseAI/ExerciseAI';
import Settings from './components/Settings/Settings';
import Profile from './components/Profile/Profile';
import Navbar from './components/Navbar/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Check if user is logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    // Apply dark mode on load
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
    }
  }, []);

  // Check for token in URL (for Google OAuth)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');

    if (token && userParam) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userParam);
      setUser(JSON.parse(userParam));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
    document.body.classList.toggle('dark');
  };

  // Allow guest users to access basic features
  const isAuthenticated = user && user._id !== 'guest';
  const isGuestOrAuthenticated = user;

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <Router>
        {isGuestOrAuthenticated && <Navbar setUser={setUser} />}
        <Routes>
          <Route path="/login" element={isGuestOrAuthenticated ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route path="/signup" element={isGuestOrAuthenticated ? <Navigate to="/" /> : <Signup setUser={setUser} />} />
          <Route path="/" element={isGuestOrAuthenticated ? <Home user={user} /> : <Navigate to="/login" />} />
          <Route path="/exercise-ai" element={isGuestOrAuthenticated ? <ExerciseAI user={user} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isGuestOrAuthenticated ? <Settings user={user} toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isGuestOrAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
