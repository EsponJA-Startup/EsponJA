import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import ClientHome from './pages/ClientHome';
import ProviderHome from './pages/ProviderHome';
import ServiceRequest from './pages/ServiceRequest';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ComingSoon from './pages/ComingSoon';
import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/client-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/home" element={<ProtectedRoute allowedRoles={['customer']}><ClientHome /></ProtectedRoute>} />
          <Route path="/provider/home" element={<ProtectedRoute allowedRoles={['provider']}><ProviderHome /></ProtectedRoute>} />
          <Route path="/client/request-service" element={<ProtectedRoute allowedRoles={['customer']}><ServiceRequest /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
