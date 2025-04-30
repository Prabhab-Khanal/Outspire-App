import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Trails() {
  const [trails, setTrails] = useState([]);
  const [viewTrail, setViewTrail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => { fetchTrails(); }, []);

  const fetchTrails = async () => {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get('http://127.0.0.1:8000/admin_panel/trails/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTrails(res.data);
  };

  const viewTrailDetails = async (id) => {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get(`http://127.0.0.1:8000/admin_panel/trails/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setViewTrail(res.data);
    setModalVisible(true);
  };

  const toggleApproval = async (id) => {
    const token = localStorage.getItem('adminToken');
    await axios.post(`http://127.0.0.1:8000/admin_panel/trails/${id}/toggle-approval/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTrails();
  };

  const deleteTrail = async (id) => {
    if (!window.confirm('Delete this trail?')) return;
    const token = localStorage.getItem('adminToken');
    await axios.delete(`http://127.0.0.1:8000/admin_panel/trails/${id}/delete/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTrails();
  };

  return (
    <div style={container}>
      <h2 style={heading}>Manage Trails</h2>
      <table style={enhancedTable}>
        <thead>
          <tr style={theadRow}>
            <th style={th}>Name</th>
            <th style={th}>Type</th>
            <th style={th}>Approved</th>
            <th style={th}>Created At</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trails.map((trail, index) => (
            <tr key={trail.id} style={index % 2 === 0 ? evenRow : oddRow}>
              <td style={td}>{trail.name}</td>
              <td style={td}>{trail.type}</td>
              <td style={td}>{trail.is_approved ? '✅' : '❌'}</td>
              <td style={td}>{trail.created_at}</td>
              <td style={td}>
                <button onClick={() => viewTrailDetails(trail.id)} style={actionBtn}>View</button>
                <button onClick={() => toggleApproval(trail.id)} style={actionBtn}>Toggle</button>
                <button onClick={() => deleteTrail(trail.id)} style={delBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Modal */}
      {modalVisible && viewTrail && (
        <div style={modalOverlay} onClick={() => setModalVisible(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3>{viewTrail.name}</h3>
            <p><strong>Location:</strong> {viewTrail.location}</p>
            <p><strong>Description:</strong> {viewTrail.description}</p>
            <p><strong>Difficulty:</strong> {viewTrail.difficulty}</p>
            <p><strong>Distance:</strong> {viewTrail.distance_km} km</p>
            <p><strong>Altitude:</strong> {viewTrail.highest_altitude} m</p>

            {/* Map */}
            <MapContainer
              style={{ height: '300px', width: '100%', borderRadius: '10px', marginTop: '10px' }}
              center={
                viewTrail.waypoints.length > 0
                  ? [viewTrail.waypoints[0].latitude, viewTrail.waypoints[0].longitude]
                  : [27.7, 85.3]
              }
              zoom={12}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {viewTrail.segments.map((seg, idx) => (
                <Polyline
                  key={idx}
                  positions={seg.points.map(p => [p.latitude, p.longitude])}
                  color={seg.routed ? 'green' : 'red'}
                />
              ))}
              {viewTrail.waypoints.map((wp, idx) => (
                <Marker key={idx} position={[wp.latitude, wp.longitude]} icon={L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [30, 30] })}>
                  <Popup>
                    <strong>{wp.name}</strong><br />
                    {wp.description}<br />
                    {wp.images.length > 0 && (
                      <img
                      src={`http://127.0.0.1:8000${wp.images[0]}`}
                      alt="wp"
                      style={{ width: '100px', marginTop: 5 }}
                    />
                    
                    )}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Images */}
            <div style={{ marginTop: 10 }}>
              <strong>Trail Images:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {viewTrail.images.map((img, i) => (
                  <img
                  key={i}
                  src={`http://127.0.0.1:8000${img}`}
                  alt="Trail"
                  style={{ width: 100, height: 100, objectFit: 'cover', margin: 5, borderRadius: 8 }}
                />
                
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div style={{ marginTop: 10 }}>
              <strong>Checklist:</strong>
              <ul>
                {viewTrail.checklist.map((item, idx) => (
                  <li key={idx}><strong>{item.key}:</strong> {item.value}</li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <button onClick={() => setModalVisible(false)} style={closeBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 Styles
const container = { marginLeft: '240px', padding: '40px 20px', backgroundColor: '#fff', minHeight: '100vh' };
const heading = { fontSize: '28px', marginBottom: '20px', color: '#2e2e2e' };
const table = { width: '100%', borderCollapse: 'collapse' };
// const actionBtn = { marginRight: 8, padding: '6px 10px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
// const delBtn = { padding: '6px 10px', backgroundColor: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalBox = { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' };
const closeBtn = { marginTop: '10px', padding: '8px 16px', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const enhancedTable = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #ddd',
  fontSize: '15px',
  borderRadius: '6px',
  overflow: 'hidden',
  boxShadow: '0 0 10px rgba(0,0,0,0.05)',
};

const theadRow = {
  backgroundColor: '#3a7758',
  color: '#fff',
};

const th = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
};

const td = {
  padding: '12px 16px',
  borderBottom: '1px solid #eee',
};

const evenRow = {
  backgroundColor: '#f9f9f9',
};

const oddRow = {
  backgroundColor: '#ffffff',
};

const actionBtn = {
  marginRight: 8,
  padding: '6px 10px',
  backgroundColor: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const delBtn = {
  padding: '6px 10px',
  backgroundColor: '#c62828',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
