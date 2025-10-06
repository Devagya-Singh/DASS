import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemAdmin.css';

const SystemAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});
  const [chairUserId, setChairUserId] = useState('');

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sysadminToken');
      const cfg = { headers: { 'x-sysadmin-token': token || '' } };
      const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const [usersRes, pubsRes, confsRes, statsRes, uploadsRes] = await Promise.all([
        axios.get(`${BASE}/admin/users`, cfg),
        axios.get(`${BASE}/admin/publications`, cfg),
        axios.get(`${BASE}/admin/conferences`, cfg),
        axios.get(`${BASE}/admin/statistics`, cfg),
        axios.get(`${BASE}/admin/uploads`, cfg)
      ]);
      
      setUsers(usersRes.data.users);
      setPublications(pubsRes.data.publications);
      setConferences(confsRes.data.conferences);
      setStatistics(statsRes.data.statistics);
      setUploads(uploadsRes.data.files || []);
    } catch (error) {
      setMessage('Error fetching data: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // User Management Functions
  const updateUser = async (userId, userData) => {
    try {
      const token = localStorage.getItem('sysadminToken');
      await axios.put(`http://localhost:5000/admin/users/${userId}`, userData, { headers: { 'x-sysadmin-token': token || '' } });
      setMessage('User updated successfully');
      fetchAllData();
    } catch (error) {
      setMessage('Error updating user: ' + error.response?.data?.message);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their publications.')) {
      try {
        const token = localStorage.getItem('sysadminToken');
        await axios.delete(`http://localhost:5000/admin/users/${userId}`, { headers: { 'x-sysadmin-token': token || '' } });
        setMessage('User deleted successfully');
        fetchAllData();
      } catch (error) {
        setMessage('Error deleting user: ' + error.response?.data?.message);
      }
    }
  };

  // Publication Management Functions
  const updatePublicationStatus = async (pubId, status) => {
    try {
      const token = localStorage.getItem('sysadminToken');
      await axios.put(`http://localhost:5000/admin/publications/${pubId}/status`, { status }, { headers: { 'x-sysadmin-token': token || '' } });
      setMessage(`Publication ${status} successfully`);
      fetchAllData();
    } catch (error) {
      setMessage('Error updating publication: ' + error.response?.data?.message);
    }
  };

  const deletePublication = async (pubId) => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      try {
        const token = localStorage.getItem('sysadminToken');
        await axios.delete(`http://localhost:5000/admin/publications/${pubId}`, { headers: { 'x-sysadmin-token': token || '' } });
        setMessage('Publication deleted successfully');
        fetchAllData();
      } catch (error) {
        setMessage('Error deleting publication: ' + error.response?.data?.message);
      }
    }
  };

  // Conference Management Functions
  const addConference = async (conferenceData) => {
    try {
      const token = localStorage.getItem('sysadminToken');
      await axios.post('http://localhost:5000/admin/conferences', conferenceData, { headers: { 'x-sysadmin-token': token || '' } });
      setMessage('Conference added successfully');
      fetchAllData();
    } catch (error) {
      setMessage('Error adding conference: ' + error.response?.data?.message);
    }
  };

  const updateConference = async (confId, conferenceData) => {
    try {
      const token = localStorage.getItem('sysadminToken');
      await axios.put(`http://localhost:5000/admin/conferences/${confId}`, conferenceData, { headers: { 'x-sysadmin-token': token || '' } });
      setMessage('Conference updated successfully');
      fetchAllData();
    } catch (error) {
      setMessage('Error updating conference: ' + error.response?.data?.message);
    }
  };

  const deleteConference = async (confId) => {
    if (window.confirm('Are you sure you want to delete this conference?')) {
      try {
        const token = localStorage.getItem('sysadminToken');
        await axios.delete(`http://localhost:5000/admin/conferences/${confId}`, { headers: { 'x-sysadmin-token': token || '' } });
        setMessage('Conference deleted successfully');
        fetchAllData();
      } catch (error) {
        setMessage('Error deleting conference: ' + error.response?.data?.message);
      }
    }
  };

  // Uploads Management Functions
  const deleteUpload = async (fileName) => {
    try {
      const token = localStorage.getItem('sysadminToken');
      await axios.delete(`http://localhost:5000/admin/uploads/${encodeURIComponent(fileName)}`, { headers: { 'x-sysadmin-token': token || '' } });
      setMessage('File deleted successfully');
      fetchAllData();
    } catch (error) {
      setMessage('Error deleting file: ' + (error.response?.data?.message || error.message));
    }
  };

  const updatePublicationMeta = async (pubId, data) => {
    try {
      const token = localStorage.getItem('sysadminToken');
      await axios.put(`http://localhost:5000/admin/publications/${pubId}/meta`, data, { headers: { 'x-sysadmin-token': token || '' } });
      setMessage('Publication updated');
      fetchAllData();
    } catch (error) {
      setMessage('Error updating publication: ' + (error.response?.data?.message || error.message));
    }
  };

  // Database Management Functions
  const resetDatabase = async () => {
    const confirm = window.prompt('Type "RESET_ALL_DATA" to confirm database reset:');
    if (confirm === 'RESET_ALL_DATA') {
      try {
        const token = localStorage.getItem('sysadminToken');
        await axios.post('http://localhost:5000/admin/reset-database', { confirm }, { headers: { 'x-sysadmin-token': token || '' } });
        setMessage('Database reset successfully. All data has been deleted.');
        fetchAllData();
      } catch (error) {
        setMessage('Error resetting database: ' + error.response?.data?.message);
      }
    }
  };

  // Modal Functions
  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setModalData({});
  };

  return (
    <div className="system-admin">
      <div className="admin-header">
        <h1>🔧 System Administration Panel</h1>
        <p>Complete control over users, publications, conferences, and database</p>
        {message && <div className="message">{message}</div>}
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length})
        </button>
        <button 
          className={activeTab === 'publications' ? 'active' : ''} 
          onClick={() => setActiveTab('publications')}
        >
          📚 Publications ({publications.length})
        </button>
        <button 
          className={activeTab === 'conferences' ? 'active' : ''} 
          onClick={() => setActiveTab('conferences')}
        >
          🏛️ Conferences ({conferences.length})
        </button>
        <button 
          className={activeTab === 'database' ? 'active' : ''} 
          onClick={() => setActiveTab('database')}
        >
          💾 Database
        </button>
        <button 
          className={activeTab === 'uploads' ? 'active' : ''} 
          onClick={() => setActiveTab('uploads')}
        >
          📄 Uploads
        </button>
      </div>

      <div className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>System Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{statistics.totalUsers || 0}</div>
                <div className="stat-breakdown">
                  {statistics.users?.map(stat => (
                    <div key={stat.role}>
                      {stat.role}: {stat.count}
                    </div>
                  ))}
                </div>
              </div>
              <div className="stat-card">
                <h3>Total Publications</h3>
                <div className="stat-number">{statistics.totalPublications || 0}</div>
                <div className="stat-breakdown">
                  {statistics.publications?.map(stat => (
                    <div key={stat.status}>
                      {stat.status}: {stat.count}
                    </div>
                  ))}
                </div>
              </div>
              <div className="stat-card">
                <h3>Total Conferences</h3>
                <div className="stat-number">{statistics.totalConferences || 0}</div>
                <div className="stat-breakdown">
                  {statistics.conferences?.map(stat => (
                    <div key={stat.conference_type}>
                      {stat.conference_type}: {stat.count}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>User Management</h2>
              <button className="btn-primary" onClick={() => openModal('addUser')}>
                ➕ Add User
              </button>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`verified-badge ${user.email_verified ? 'verified' : 'unverified'}`}>
                          {user.email_verified ? '✅' : '❌'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-edit" 
                          onClick={() => openModal('editUser', user)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => deleteUser(user.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Publications Tab */}
        {activeTab === 'publications' && (
          <div className="publications-section">
            <div className="section-header">
              <h2>Publication Management</h2>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Access</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map(pub => (
                    <tr key={pub.id}>
                      <td>{pub.id}</td>
                      <td className="title-cell">{pub.title}</td>
                      <td>{pub.author_name} ({pub.author_email})</td>
                      <td>
                        <span className={`status-badge ${pub.status}`}>
                          {pub.status}
                        </span>
                      </td>
                      <td>{pub.access_type || 'free'}</td>
                      <td>{new Date(pub.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-approve" 
                            onClick={() => updatePublicationStatus(pub.id, 'approved')}
                            disabled={pub.status === 'approved'}
                          >
                            ✅
                          </button>
                          <button 
                            className="btn-reject" 
                            onClick={() => updatePublicationStatus(pub.id, 'rejected')}
                            disabled={pub.status === 'rejected'}
                          >
                            ❌
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => deletePublication(pub.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conferences Tab */}
        {activeTab === 'conferences' && (
          <div className="conferences-section">
            <div className="section-header">
              <h2>Conference Management</h2>
              <button className="btn-primary" onClick={() => openModal('addConference')}>
                ➕ Add Conference
              </button>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conferences.map(conf => (
                    <tr key={conf.id}>
                      <td>{conf.id}</td>
                      <td className="title-cell">{conf.name}</td>
                      <td>{conf.location}</td>
                      <td>
                        <span className={`type-badge ${conf.conference_type}`}>
                          {conf.conference_type}
                        </span>
                      </td>
                      <td>{new Date(conf.start_date).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-edit" 
                          onClick={() => openModal('editConference', conf)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => deleteConference(conf.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="database-section">
            <h2>Database Management</h2>
            <div className="database-actions">
              <div className="action-card">
                <h3>🔄 Refresh Data</h3>
                <p>Reload all data from database</p>
                <button className="btn-primary" onClick={fetchAllData}>
                  Refresh
                </button>
              </div>
              <div className="action-card danger">
                <h3>⚠️ Reset Database</h3>
                <p>Delete ALL data (users, publications, conferences)</p>
                <button className="btn-danger" onClick={resetDatabase}>
                  Reset Database
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <div className="uploads-section">
            <div className="section-header">
              <h2>Uploads</h2>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map(file => (
                    <tr key={file.name}>
                      <td>{file.name}</td>
                      <td>
                        <a href={`http://localhost:5000${file.path}`} target="_blank" rel="noopener noreferrer">View</a>
                      </td>
                      <td>
                        <button className="btn-delete" onClick={() => deleteUpload(file.name)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'addUser' && 'Add User'}
                {modalType === 'editUser' && 'Edit User'}
                {modalType === 'addConference' && 'Add Conference'}
                {modalType === 'editConference' && 'Edit Conference'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {modalType === 'editConference' && (
                <div>
                  <label>Name</label>
                  <input defaultValue={modalData.name} onBlur={(e) => setModalData({ ...modalData, name: e.target.value })} />
                  <label>Location</label>
                  <input defaultValue={modalData.location} onBlur={(e) => setModalData({ ...modalData, location: e.target.value })} />
                  <label>Start Date</label>
                  <input type="date" defaultValue={(modalData.start_date || '').split('T')[0]} onBlur={(e) => setModalData({ ...modalData, start_date: e.target.value })} />
                  <label>End Date</label>
                  <input type="date" defaultValue={(modalData.end_date || '').split('T')[0]} onBlur={(e) => setModalData({ ...modalData, end_date: e.target.value })} />
                  <label>Description</label>
                  <textarea defaultValue={modalData.description} onBlur={(e) => setModalData({ ...modalData, description: e.target.value })} />
                  <button className="btn-primary" onClick={() => updateConference(modalData.id, modalData)}>Save</button>
                </div>
              )}
              {modalType === 'assignChair' && (
                <div>
                  <p>Assign a user as chair for: <strong>{modalData.name}</strong></p>
                  <label>User ID</label>
                  <input value={chairUserId} onChange={(e) => setChairUserId(e.target.value)} placeholder="Enter user ID" />
                  <button className="btn-primary" onClick={() => assignChair(modalData.id)}>Assign</button>
                </div>
              )}
              {modalType === 'moderateSubmissions' && (
                <div>
                  <p>Submissions for: <strong>{modalData.conf?.name}</strong></p>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Paper</th>
                          <th>Author</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(modalData.submissions || []).map(sub => (
                          <tr key={sub.id}>
                            <td>{sub.id}</td>
                            <td>{sub.paper_title}</td>
                            <td>{sub.author_name}</td>
                            <td>{sub.status}</td>
                            <td>{new Date(sub.submitted_at).toLocaleString()}</td>
                            <td>
                              <button className="btn-approve" onClick={() => updateSubmissionStatus(modalData.confId || modalData.conf?.id, sub.id, 'approved')}>✅</button>
                              <button className="btn-reject" onClick={() => updateSubmissionStatus(modalData.confId || modalData.conf?.id, sub.id, 'rejected')}>❌</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdmin;

