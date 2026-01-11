import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(response.data);
        setFilteredReports(response.data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    fetchReports();
  }, [navigate]);

  useEffect(() => {
    let filtered = reports;

    if (filters.type) {
      filtered = filtered.filter(report => report.report_type === filters.type);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(report =>
        report.date >= filters.startDate && report.date <= filters.endDate
      );
    }

    setFilteredReports(filtered);
  }, [filters, reports]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownload = async (reportId, filename) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${reportId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading report:', err);
    }
  };

  return (
    <div className="card">
      <h2>My Reports</h2>
      <div className="filters">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Blood Test">Blood Test</option>
          <option value="X-Ray">X-Ray</option>
          <option value="MRI">MRI</option>
          <option value="CT Scan">CT Scan</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          placeholder="Start Date"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          placeholder="End Date"
        />
      </div>
      <div className="reports-list">
        {filteredReports.map(report => (
          <div key={report.id} className="report-item">
            <h4>{report.original_name}</h4>
            <p>Type: {report.report_type}</p>
            <p>Date: {report.date}</p>
            <p>Vitals: {report.vitals}</p>
            <button onClick={() => handleDownload(report.id, report.original_name)}>Download</button>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default ViewReports;
