import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Save to localStorage
      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
      }
      localStorage.setItem('user_role', response.data.role);

      // Since it's MVP, we just redirect based on role
      if (response.data.role === 'customer') {
        navigate('/client/home');
      } else if (response.data.role === 'provider') {
        navigate('/provider/home');
      } else {
        setError('Tipo de usuário desconhecido.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocorreu um erro ao fazer login. Verifique suas credenciais.');
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
          <h2>Bem-vindo de volta!</h2>
          <p className="auth-subtitle">Acesse sua conta do EsponJÁ</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="mock-alert" style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#f87171', marginBottom: '1rem' }}>{error}</div>}
            
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="form-input" 
                placeholder="seu@email.com" 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="form-input" 
                placeholder="••••••••" 
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary auth-btn">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="form-footer">
            Não tem uma conta? <Link to="/register" className="auth-link">Cadastre-se</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
