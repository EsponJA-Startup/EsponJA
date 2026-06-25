import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './Auth.css';

export default function FirstAccess() {
  const [formData, setFormData] = useState({ email: '', first_access_password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/first-access', formData);
      // Valid credentials! Proceed to phase 2
      navigate('/register', { 
        state: { 
          waitlist_id: response.data.waitlist_id,
          email: response.data.email,
          phone: response.data.phone,
          first_access_password: formData.first_access_password,
          intended_role: response.data.intended_role
        } 
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Erro ao validar credenciais. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-main">
        <div className="auth-card">
          <h2>Primeiro Acesso</h2>
          <p className="auth-subtitle">Insira o e-mail cadastrado na lista de espera e a senha enviada para você.</p>
          
          <form onSubmit={handleSubmit}>
            {error && <div className="mock-alert" style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#f87171' }}>{error}</div>}
            
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="form-input" 
                placeholder="seu@email.com" 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Senha de Primeiro Acesso</label>
              <input 
                type="password" 
                name="first_access_password" 
                value={formData.first_access_password} 
                onChange={handleChange} 
                required 
                className="form-input" 
                placeholder="Insira a senha recebida" 
              />
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Validando...' : 'Continuar Cadastro'}
            </button>
          </form>

          <div className="form-footer">
            <Link to="/login" className="auth-link">Voltar para o Login</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
