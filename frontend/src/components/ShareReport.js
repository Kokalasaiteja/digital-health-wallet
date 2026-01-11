import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShareReport = () => {
  const [reports, setReports] = useState([]);
  const [sharedReports, setSharedReports] = useState([]);
  const [shareData, setShareData] = useState({ reportId: '', email: '', accessType: 'read' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const backendURL = process.env.REACT_APP_BACKEND_URL; // ✅ use env variable

        const reportsResponse = await axios.get(`${backendURL}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(reportsResponse.data);

        const sharedResponse = await axios.get(`${backendURL}/api/share/shared-with-me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSharedReports(sharedResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [navigate]);

  const handleShareDataChange = (e) => {
    setShareData({ ...shareData, [e.target.name]: e.target.value });
  };

  const handleShare = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const backendURL = process.env.REACT_APP_BACKEND_URL; // ✅ use env variable
      await axios.post(`${backendURL}/api/share`, shareData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Report shared successfully!');
      setShareData({ reportId: '', email: '', accessType: 'read' });
    } catch (err) {
      console.error('Error sharing report:', err);
      alert('Error sharing report. Please check the email and try again.');
    }
  };

  return (
    <div className="card">
      <h2>Share Reports</h2>
      <form onSubmit={handleShare} className="share-form">
        <div className="form-group">
          <label>Select Report:</label>
          <select name="reportId" value={shareData.reportId} onChange={handleShareDataChange} required>
            <option value="">Choose a report</option>
            {reports.map(report => (
              <option key={report.id} value={report.id}>{report.original_name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Email to share with:</label>
          <input
            type="email"
            name="email"
            value={shareData.email}
            onChange={handleShareDataChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Access Type:</label>
          <select name="accessType" value={shareData.accessType} onChange={handleShareDataChange}>
            <option value="read">Read Only</option>
          </select>
        </div>
        <button type="submit">Share Report</button>
      </form>

      <h3>Reports Shared with Me</h3>
      <div className="shared-reports-list">
        {sharedReports.map(shared => (
          <div key={shared.id} className="shared-report-item">
            <h4>{shared.filename}</h4>
            <p>Shared by: {shared.owner_username}</p>
            <p>Access: {shared.access_type}</p>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default ShareReport;