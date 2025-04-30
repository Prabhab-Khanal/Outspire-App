import React, { useEffect, useState } from 'react';
import axios from '../services/api'; // Your axios setup

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/admin_panel/payments/');
      setPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error.response?.data || error.message);
      alert('Failed to load payments');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments
  .filter(payment => {
    const userField = typeof payment.user === 'string' ? payment.user : String(payment.user);
    const paymentIdField = typeof payment.payment_id === 'string' ? payment.payment_id : String(payment.payment_id);

    const matchesSearch =
      userField.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paymentIdField.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.payment_status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    if (sortField === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortField === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });


  if (loading) return <div style={loadingStyle}>Loading...</div>;

  return (
    <div style={paymentsContainerStyle}>
      <h2 style={pageTitleStyle}>All Payments</h2>

      {/* Search + Filter + Sort Controls */}
      <div style={controlsContainerStyle}>
        <input
          type="text"
          placeholder="Search by user or payment ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={selectStyle}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={selectStyle}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Payment ID</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment, index) => (
              <tr key={payment.payment_id} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                <td style={tdStyle}>{payment.payment_id}</td>
                <td style={tdStyle}>{payment.user}</td>
                <td style={tdStyle}>${payment.amount}</td>
                <td style={tdStyle}>{payment.payment_status}</td>
                <td style={tdStyle}>{new Date(payment.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 📦 Internal CSS styles

const paymentsContainerStyle = {
  marginLeft: '240px',
  padding: '40px 20px',
  backgroundColor: '#fffaf0',
  minHeight: '100vh',
  boxSizing: 'border-box',
};

const loadingStyle = {
  marginLeft: '240px',
  padding: '40px',
  fontSize: '20px',
};

const pageTitleStyle = {
  marginBottom: '30px',
  color: '#5C4033',
  fontSize: '28px',
};

const controlsContainerStyle = {
  marginBottom: '20px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  alignItems: 'center',
};

const searchInputStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px',
  width: '250px',
};

const selectStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

const tableContainerStyle = {
  overflowX: 'auto',
  backgroundColor: '#f0e5d8',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
