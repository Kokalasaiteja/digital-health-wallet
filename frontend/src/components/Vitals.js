import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Vitals = () => {
  const [vitals, setVitals] = useState([]);
  const [filteredVitals, setFilteredVitals] = useState([]);
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' });
  const [newVital, setNewVital] = useState({ vital_type: '', value: '', date: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchVitals = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/vitals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVitals(response.data);
        setFilteredVitals(response.data);
      } catch (err) {
        console.error('Error fetching vitals:', err);
      }
    };

    fetchVitals();
  }, [navigate]);

  useEffect(() => {
    let filtered = vitals;

    if (filters.type) {
      filtered = filtered.filter(vital => vital.vital_type === filters.type);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(vital =>
        vital.date >= filters.startDate && vital.date <= filters.endDate
      );
    }

    setFilteredVitals(filtered);
  }, [filters, vitals]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleNewVitalChange = (e) => {
    setNewVital({ ...newVital, [e.target.name]: e.target.value });
  };

  const handleAddVital = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/vitals', newVital, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Vital added successfully!');
      setNewVital({ vital_type: '', value: '', date: '' });
      // Refresh vitals
      const response = await axios.get('http://localhost:5000/api/vitals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVitals(response.data);
    } catch (err) {
      console.error('Error adding vital:', err);
      alert('Error adding vital. Please try again.');
    }
  };

  const chartData = {
    labels: filteredVitals.map(v => v.date).reverse(),
    datasets: [{
      label: filters.type || 'All Vitals',
      data: filteredVitals.map(v => v.value).reverse(),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Vitals Trend',
      },
    },
  };

  return (
    <div className="card">
      <h2>My Vitals</h2>

      <div className="add-vital-form">
        <h3>Add New Vital</h3>
        <form onSubmit={handleAddVital}>
          <div className="form-group">
            <label>Vital Type:</label>
            <select name="vital_type" value={newVital.vital_type} onChange={handleNewVitalChange} required>
              <option value="">Select Type</option>
              <option value="Blood Pressure">Blood Pressure</option>
              <option value="Heart Rate">Heart Rate</option>
              <option value="Blood Sugar">Blood Sugar</option>
              <option value="Weight">Weight</option>
              <option value="Temperature">Temperature</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Value:</label>
            <input
              type="number"
              name="value"
              value={newVital.value}
              onChange={handleNewVitalChange}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={newVital.date}
              onChange={handleNewVitalChange}
              required
            />
          </div>
          <button type="submit">Add Vital</button>
        </form>
      </div>

      <div className="filters">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Blood Pressure">Blood Pressure</option>
          <option value="Heart Rate">Heart Rate</option>
          <option value="Blood Sugar">Blood Sugar</option>
          <option value="Weight">Weight</option>
          <option value="Temperature">Temperature</option>
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

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="vitals-list">
        <h3>Vitals History</h3>
        <ul>
          {filteredVitals.map(vital => (
            <li key={vital.id}>
              {vital.vital_type}: {vital.value} on {vital.date}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default Vitals;
