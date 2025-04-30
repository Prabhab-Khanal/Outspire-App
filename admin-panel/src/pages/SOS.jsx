import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icons not appearing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export default function SOS() {
  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchSOSRequests = async () => {
    try {
      const response = await axios.get('/admin_panel/sos-list/', {
      
      });
      setSosRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching SOS requests:', error.response?.data || error.message);
      alert('Failed to load SOS requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOSRequests();
  }, []);

  const filteredSOS = sosRequests.filter((sos) =>
    (sos.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sos.user_id?.toString() || '').includes(searchTerm)
  );

  if (loading) return <div style={loadingStyle}>Loading...</div>;

  return (
    <div style={sosContainerStyle}>
      <h2 style={pageTitleStyle}>SOS Requests</h2>

      {/* Search Input */}
      <div style={controlsContainerStyle}>
        <input
          type="text"
          placeholder="Search by username or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      {/* SOS Requests Table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>User ID</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Emergency Contact</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSOS.map((sos, index) => (
              <tr key={index} style={index % 2 === 0 ? evenRowStyle : oddRowStyle}>
                <td style={tdStyle}>{sos.user_id}</td>
                <td style={tdStyle}>{sos.username}</td>
                <td style={tdStyle}>
                  {sos.emergency_contact ? (
                    <>
                      {sos.emergency_contact.contact_name}<br />
                      {sos.emergency_contact.phone_number}
                    </>
                  ) : 'N/A'}
                </td>
                <td style={tdStyle}>{new Date(sos.timestamp).toLocaleString()}</td>
                <td style={tdStyle}>
                  {sos.latitude && sos.longitude ? (
                    <button onClick={() => setSelectedLocation(sos)} style={viewButtonStyle}>
                      View Map
                    </button>
                  ) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Map */}
      {selectedLocation && (
        <div style={mapModalOverlayStyle} onClick={() => setSelectedLocation(null)}>
          <div style={mapModalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 10 }}>Location of SOS - {selectedLocation.username}</h3>
            <MapContainer
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              zoom={13}
              style={{ height: '300px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
                <Popup>
                  SOS Location<br />
                  Lat: {selectedLocation.latitude}<br />
                  Lng: {selectedLocation.longitude}
                </Popup>
              </Marker>
            </MapContainer>
            <button style={closeBtnStyle} onClick={() => setSelectedLocation(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const sosContainerStyle = {
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
  gap: '10px',
};

const searchInputStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px',
  width: '250px',
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

const viewButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#8d6e63',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const mapModalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const mapModalContentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '80%',
  maxWidth: '600px',
  boxShadow: '0 0 20px rgba(0,0,0,0.2)',
};

const closeBtnStyle = {
  marginTop: '10px',
  padding: '8px 16px',
  backgroundColor: '#d32f2f',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
