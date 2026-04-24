import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import ClientHome from './pages/ClientHome';
import ProviderHome from './pages/ProviderHome';
import ServiceRequest from './pages/ServiceRequest';
import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/client/home" element={<ClientHome />} />
          <Route path="/provider/home" element={<ProviderHome />} />
          <Route path="/client/request-service" element={<ServiceRequest />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
