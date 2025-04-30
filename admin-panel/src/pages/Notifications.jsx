import React, { useState } from 'react';
import axios from 'axios';

export default function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://127.0.0.1:8000/admin_panel/notifications/send/', {
        title,
        body,
        target,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(response.data.message);
      setTitle('');
      setBody('');
    } catch (err) {
      console.error(err);
      setMessage('Error sending notification.');
    }
  };

  return (
    <div style={notificationsContainerStyle}>
      <h2 style={pageTitleStyle}>Send Notification</h2>

      {message && (
        <p style={messageStyle}>{message}</p>
      )}

      <form onSubmit={handleSendNotification} style={formStyle}>
        <input
          type="text"
          placeholder="Notification Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={inputStyle}
        />
        <textarea
          placeholder="Notification Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          style={textareaStyle}
        />
        <select value={target} onChange={(e) => setTarget(e.target.value)} style={selectStyle}>
          <option value="all">All Users</option>
          <option value="premium">Premium Users</option>
          <option value="regular">Regular Users</option>
        </select>

        <button type="submit" style={buttonStyle}>Send Notification</button>
      </form>
    </div>
  );
}

// 📦 Internal CSS Styles

const notificationsContainerStyle = {
  marginLeft: '240px', // Sidebar spacing
  padding: '40px 20px',
  backgroundColor: '#fffaf0',
  minHeight: '100vh',
  boxSizing: 'border-box',
};

const pageTitleStyle = {
  marginBottom: '30px',
  color: '#5C4033',
  fontSize: '28px',
};

const messageStyle = {
  marginBottom: '20px',
  color: '#2E7D32',
  fontWeight: 'bold',
};

const formStyle = {
  backgroundColor: '#f0e5d8',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  width: '100%',
  maxWidth: '500px',
};

const inputStyle = {
  padding: '12px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const textareaStyle = {
  padding: '12px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  height: '120px',
  resize: 'vertical',
};

const selectStyle = {
  padding: '12px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '12px',
  fontSize: '16px',
  backgroundColor: '#5C4033',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

