import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Trails from './pages/Trails';
import Notifications from './pages/Notifications';
import Payments from './pages/Payments';
import SOS from './pages/SOS';
import Posts from './pages/Posts';
import Sidebar from './components/Sidebar'; // Sidebar for admin navigation

export default function App() {
  const isAuthenticated = !!localStorage.getItem('adminToken'); // Check if token exists

  const appContainerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9f5f0', // Light earthy background
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    transition: 'all 0.3s ease-in-out',
  };

  const mainContentStyle = {
    flex: 1,
    marginLeft: 0, // No sidebar margin needed
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#fffaf0', // Soft beige background
    minHeight: '100vh',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <Router>
      <div style={appContainerStyle}>
        {/* Sidebar shown only if logged in */}
        {isAuthenticated && <Sidebar />}

        <div style={mainContentStyle}>
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />

            {/* Admin Protected Routes */}
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" replace />} />
            <Route path="/trails" element={isAuthenticated ? <Trails /> : <Navigate to="/login" replace />} />
            <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" replace />} />
            <Route path="/payments" element={isAuthenticated ? <Payments /> : <Navigate to="/login" replace />} />
            <Route path="/SOS" element={isAuthenticated ? <SOS/> : <Navigate to="/login" replace />} />
            <Route path="/posts" element={isAuthenticated ? <Posts/> : <Navigate to="/login" replace />} />
            {/* Catch-All Redirect */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
