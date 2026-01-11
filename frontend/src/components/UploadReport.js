import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadReport = () => {
  const [formData, setFormData] = useState({
    file: null,
    report_type: '',
    date: '',
    vitals: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const data = new FormData();
    data.append('file', formData.file);
    data.append('report_type', formData.report_type);
    data.append('date', formData.date);
    data.append('vitals', formData.vitals);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/reports/upload`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Report uploaded successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err.response || err); // optional: see backend error
    }
  };

  return (
    <div className="card">
      <h2>Upload Medical Report</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select File:</label>
          <input
            type="file"
            name="file"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </div>
        <div className="form-group">
          <label>Report Type:</label>
          <select name="report_type" value={formData.report_type} onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="Blood Test">Blood Test</option>
            <option value="X-Ray">X-Ray</option>
            <option value="MRI">MRI</option>
            <option value="CT Scan">CT Scan</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Associated Vitals (optional):</label>
          <textarea
            name="vitals"
            value={formData.vitals}
            onChange={handleChange}
            placeholder="e.g., Blood Pressure: 120/80, Sugar: 90"
          />
        </div>
        <button type="submit">Upload Report</button>
      </form>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default UploadReport;
