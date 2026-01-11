import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [vitals, setVitals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const reportsResponse = await axios.get('http://localhost:5000/api/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(reportsResponse.data);

        const vitalsResponse = await axios.get('http://localhost:5000/api/vitals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVitals(vitalsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <header className="header">
        <h1>Digital Health Wallet</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <div className="dashboard">
        <nav className="nav">
          <button onClick={() => navigate('/upload')}>Upload Report</button>
          <button onClick={() => navigate('/vitals')}>Manage Vitals</button>
          <button onClick={() => navigate('/view-reports')}>View Reports</button>
          <button onClick={() => navigate('/share')}>Share Reports</button>
        </nav>
        <div className="summary">
          <div className="card">
            <h3>Total Reports</h3>
            <p>{reports.length}</p>
          </div>
          <div className="card">
            <h3>Total Vitals Entries</h3>
            <p>{vitals.length}</p>
          </div>
        </div>
        <div className="recent-activity">
          <h3>Recent Reports</h3>
          <ul>
            {reports.slice(0, 5).map(report => (
              <li key={report.id}>{report.original_name} - {report.date}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
