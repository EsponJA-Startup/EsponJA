import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import './App.css'; 

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
