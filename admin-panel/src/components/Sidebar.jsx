import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation(); // get current path

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <div style={sidebarStyle}>
      <h2 style={headerStyle}>Admin Panel</h2>

      <ul style={listStyle}>
        <SidebarLink to="/dashboard" label=" Dashboard" active={location.pathname === '/dashboard'} />
        <SidebarLink to="/users" label=" Manage Users" active={location.pathname === '/users'} />
        <SidebarLink to="/trails" label=" Manage Trails" active={location.pathname === '/trails'} />
        <SidebarLink to="/notifications" label=" Send Notifications" active={location.pathname === '/notifications'} />
        <SidebarLink to="/payments" label=" Payments" active={location.pathname === '/payments'} />
        <SidebarLink to="/SOS" label=" SOS" active={location.pathname === '/SOS'} />
        <SidebarLink to="/posts" label="Posts" active={location.pathname === '/posts'} />
        <li style={listItemStyle}>
          <a
            href="#"
            onClick={handleLogout}
            style={{
              ...linkStyle,
              color: '#B71C1C',
              backgroundColor: '#f5d7d7', // red hover effect
            }}
          >
             Logout
          </a>
        </li>
      </ul>
    </div>
  );
}

// ✅ SidebarLink Component
function SidebarLink({ to, label, active }) {
  return (
    <li style={listItemStyle}>
      <Link
        to={to}
        style={{
          ...linkStyle,
          backgroundColor: active ? '#c8b89e' : '#e5d3b3', // active link highlight
        }}
      >
        {label}
      </Link>
    </li>
  );
}

// 📦 Styles

const sidebarStyle = {
  width: '220px',
  height: '100vh',
  backgroundColor: '#D2B48C', // earthy beige
  padding: '20px',
  position: 'fixed',
  top: 0,
  left: 0,
  overflowY: 'auto',
  boxShadow: '2px 0px 8px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const headerStyle = {
  color: '#3E2723',
  marginBottom: '30px',
  fontSize: '24px',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
  width: '100%',
};

const listItemStyle = {
  marginBottom: '20px',
  width: '100%',
};

const linkStyle = {
  textDecoration: 'none',
  color: '#4E342E', // earthy dark brown
  fontWeight: '600',
  fontSize: '16px',
  width: '100%',
  display: 'block',
  padding: '10px 15px',
  borderRadius: '8px',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  backgroundColor: '#e5d3b3', // normal color
};
