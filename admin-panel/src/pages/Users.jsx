import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://127.0.0.1:8000/admin_panel/users/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const banOrUnbanUser = async (userId, isActive) => {
    const confirmText = isActive ? 'ban' : 'unban';
    if (!window.confirm(`Are you sure you want to ${confirmText} this user?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`http://127.0.0.1:8000/admin_panel/users/${userId}/toggle-ban/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert(`User has been ${confirmText}ned.`);
      setUsers(prev =>
        prev.map(u =>
          u.user_id === userId
            ? { ...u, is_active: !isActive, is_email_verified: !isActive }
            : u
        )
      );
    } catch (error) {
      console.error(`Error trying to ${confirmText} user:`, error);
      alert(`Failed to ${confirmText} user.`);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={usersContainerStyle}>
      <h2 style={pageTitleStyle}>Manage Users</h2>

      <div style={controlsContainerStyle}>
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={filterSelectStyle}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="premium">Premium</option>
          <option value="regular">Regular</option>
        </select>
      </div>

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Email Verified</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Active</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.user_id} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                <td style={tdStyle}>{user.user_id}</td>
                <td style={tdStyle}>{user.username}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.is_email_verified ? 'Yes' : 'No'}</td>
                <td style={tdStyle}>{user.role}</td>
                <td style={tdStyle}>{user.is_active ? 'Yes' : 'No'}</td>
                <td style={tdStyle}>
                  {user.is_active ? (
                    <button onClick={() => banOrUnbanUser(user.user_id, true)} style={banButtonStyle}>
                      Ban
                    </button>
                  ) : (
                    <button onClick={() => banOrUnbanUser(user.user_id, false)} style={unbanButtonStyle}>
                      Unban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 📦 Styles

const usersContainerStyle = {
  marginLeft: '240px',
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

const controlsContainerStyle = {
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const searchInputStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px',
  width: '250px',
};

const filterSelectStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

const tableContainerStyle = {
  overflowX: 'auto',
  backgroundColor: '#f0e5d8',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  color: '#4E342E',
};

const thStyle = {
  backgroundColor: '#D2B48C',
  padding: '12px',
  textAlign: 'left',
  fontSize: '16px',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #ccc',
  fontSize: '15px',
};

const evenRowStyle = {
  backgroundColor: '#fdf6ec',
};

const oddRowStyle = {
  backgroundColor: '#f9f1e7',
};

const banButtonStyle = {
  padding: '6px 10px',
  backgroundColor: '#c62828',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const unbanButtonStyle = {
  padding: '6px 10px',
  backgroundColor: '#388e3c',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};
