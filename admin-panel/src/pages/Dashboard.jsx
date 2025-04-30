import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://127.0.0.1:8000/admin_panel/dashboard-stats/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  // Chart Data Preparation
  const pieData = stats ? [
    { name: 'Active Users', value: stats.users.active },
    { name: 'Premium Users', value: stats.users.premium },
    { name: 'Total Users', value: stats.users.total - stats.users.premium - stats.users.active },
  ] : [];

  const barData = stats ? [
    { name: 'Total Trails', value: stats.trails.total },
    { name: 'Approved Trails', value: stats.trails.approved },
  ] : [];

  const COLORS = ['#5C4033', '#A1887F', '#D7CCC8'];

  return (
    <div style={dashboardContainerStyle}>
      <h2 style={pageTitleStyle}>Admin Dashboard</h2>

      {stats ? (
        <>
          {/* Stat Cards */}
          <div style={cardGridStyle}>
            <StatCard title="Total Users" value={stats.users.total} />
            <StatCard title="Active Users" value={stats.users.active} />
            <StatCard title="Premium Users" value={stats.users.premium} />
            <StatCard title="Total Trails" value={stats.trails.total} />
            <StatCard title="Approved Trails" value={stats.trails.approved} />
            <StatCard title="Total Posts" value={stats.posts.total} />
          </div>

          {/* Charts Section */}
          <div style={chartsContainerStyle}>
            <div style={chartBoxStyle}>
              <h3 style={chartTitleStyle}>User Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={chartBoxStyle}>
              <h3 style={chartTitleStyle}>Trail Statistics</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#5C4033" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p>Loading dashboard stats...</p>
      )}
    </div>
  );
}

// 📦 Small Card Component
function StatCard({ title, value }) {
  return (
    <div style={cardStyle}>
      <h4 style={cardTitleStyle}>{title}</h4>
      <p style={cardValueStyle}>{value}</p>
    </div>
  );
}

// 📦 Internal CSS styles

const dashboardContainerStyle = {
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

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
};

const cardStyle = {
  backgroundColor: '#f0e5d8',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
};

const cardTitleStyle = {
  color: '#3E2723',
  marginBottom: '10px',
};

const cardValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#4E342E',
};

const chartsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '20px',
};

const chartBoxStyle = {
  backgroundColor: '#f0e5d8',
  padding: '20px',
  borderRadius: '10px',
  flex: '1 1 400px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
};

const chartTitleStyle = {
  marginBottom: '20px',
  textAlign: 'center',
  color: '#3E2723',
};

