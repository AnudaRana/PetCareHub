 import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ViewTimeSlots from './pages/ViewTimeSlots';

const App = () => (
  <Router>
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/view-time-slots" element={<ViewTimeSlots />} />
          <Route path="/" element={<Navigate to="/view-time-slots" replace />} />
          <Route path="*" element={<Navigate to="/view-time-slots" replace />} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;