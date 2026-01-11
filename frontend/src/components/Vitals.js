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
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  const [vitals, setVitals] = useState([]);
  const [filteredVitals, setFilteredVitals] = useState([]);
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '' });
  const [newVital, setNewVital] = useState({ vital_type: '', value: '', date: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchVitals = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vitals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVitals(res.data);
        setFilteredVitals(res.data);
      } catch (err) {
        console.error('Error fetching vitals:', err);
      }
    };

    fetchVitals();
  }, [navigate, API_URL]);

  useEffect(() => {
    let filtered = vitals;

    if (filters.type) {
      filtered = filtered.filter(v => v.vital_type === filters.type);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(
        v => v.date >= filters.startDate && v.date <= filters.endDate
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
      await axios.post(`${API_URL}/api/vitals`, newVital, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Vital added successfully!');
      setNewVital({ vital_type: '', value: '', date: '' });

      const res = await axios.get(`${API_URL}/api/vitals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVitals(res.data);
    } catch (err) {
      console.error('Error adding vital:', err);
      alert('Failed to add vital');
    }
  };

  const chartData = {
    labels: [...filteredVitals].reverse().map(v => v.date),
    datasets: [
      {
        label: filters.type || 'All Vitals',
        data: [...filteredVitals].reverse().map(v => v.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.2
      }
    ]
  };

  return (
    <div className="card">
      <h2>My Vitals</h2>

      <form onSubmit={handleAddVital}>
        <select name="vital_type" value={newVital.vital_type} onChange={handleNewVitalChange} required>
          <option value="">Select Type</option>
          <option value="Blood Pressure">Blood Pressure</option>
          <option value="Heart Rate">Heart Rate</option>
          <option value="Blood Sugar">Blood Sugar</option>
          <option value="Weight">Weight</option>
          <option value="Temperature">Temperature</option>
        </select>

        <input
          type="number"
          name="value"
          value={newVital.value}
          onChange={handleNewVitalChange}
          required
        />

        <input
          type="date"
          name="date"
          value={newVital.date}
          onChange={handleNewVitalChange}
          required
        />

        <button type="submit">Add Vital</button>
      </form>

      <div className="filters">
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Blood Pressure">Blood Pressure</option>
          <option value="Heart Rate">Heart Rate</option>
          <option value="Blood Sugar">Blood Sugar</option>
          <option value="Weight">Weight</option>
          <option value="Temperature">Temperature</option>
        </select>

        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
      </div>

      <Line data={chartData} />

      <ul>
        {filteredVitals.map(v => (
          <li key={v.id}>
            {v.vital_type}: {v.value} on {v.date}
          </li>
        ))}
      </ul>

      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default Vitals;