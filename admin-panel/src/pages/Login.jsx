import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/admin_panel/login/', {
        email,
        password,
      });
      localStorage.setItem('adminToken', response.data.access);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          Outspire<span style={{ color: '#888' }}> Admin</span>
        </h1>
        <p style={subtitleStyle}>Explore. Manage. Lead.</p>
        <p style={descStyle}>
          Please enter your credentials to access trail data, user reports, premium analytics, and more.
        </p>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <div style={passwordWrapperStyle}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: '36px', marginBottom: '0' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={eyeIconStyle}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      </div>
    </div>
  );
}

// 🎨 Styles
const pageWrapperStyle = {
  height: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #e3ffe7 0%, #d9e7ff 100%)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'Segoe UI, sans-serif',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
  width: '90%',
  maxWidth: '420px',
  textAlign: 'center',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
};

const titleStyle = {
  fontSize: '30px',
  fontWeight: 'bold',
  marginBottom: '6px',
  color: '#222',
};

const subtitleStyle = {
  marginBottom: '10px',
  fontSize: '14px',
  color: '#666',
};

const descStyle = {
  fontSize: '13px',
  color: '#444',
  marginBottom: '20px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: '14px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '14px',
  backgroundColor: '#fafafa',
  outlineColor: '#f5c400',
  boxSizing: 'border-box',
};

const passwordWrapperStyle = {
  position: 'relative',
  width: '100%',
  marginBottom: '14px',
};

const eyeIconStyle = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  cursor: 'pointer',
  color: '#777',
  fontSize: '16px',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#f5c400',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '15px',
  color: '#000',
  cursor: 'pointer',
  marginTop: '8px',
};

const errorStyle = {
  backgroundColor: '#ffe6e6',
  color: '#c0392b',
  padding: '10px',
  borderRadius: '6px',
  marginBottom: '15px',
  fontSize: '13px',
};
