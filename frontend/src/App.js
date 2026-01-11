import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UploadReport from './components/UploadReport';
import ViewReports from './components/ViewReports';
import Vitals from './components/Vitals';
import ShareReport from './components/ShareReport';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadReport />} />
          <Route path="/view-reports" element={<ViewReports />} />
          <Route path="/vitals" element={<Vitals />} />
          <Route path="/share" element={<ShareReport />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
