import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './Auth.css';

export default function Register() {
  const location = useLocation();
  const [role, setRole] = useState('customer'); // Default to customer
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    whatsapp_number: '',
    specialty: '',
    password: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'provider') {
      setRole('provider');
    } else {
      setRole('customer');
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/auth/register', { ...formData, role });
      
      // Save to localStorage
      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
      }
      localStorage.setItem('user_role', response.data.role);

      setSubmitted(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocorreu um erro ao realizar o cadastro. Tente novamente.');
      }
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-main">
        <div className="auth-card" style={{ maxWidth: '550px' }}>
          <h2>Crie sua conta</h2>
          <p className="auth-subtitle">Junte-se à revolução dos serviços domésticos</p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ flex: 1 }}
              onClick={() => { setRole('customer'); setSubmitted(false); setError(null); }}
            >
              Quero Contratar
            </button>
            <button 
              className={`btn ${role === 'provider' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ flex: 1 }}
              onClick={() => { setRole('provider'); setSubmitted(false); setError(null); }}
            >
              Quero Trabalhar
            </button>
          </div>

          {submitted ? (
            <div className="mock-alert">
              <strong>Cadastro realizado!</strong> Em um ambiente de produção o {role === 'provider' ? 'profissional' : 'cliente'} receberia um e-mail de verificação para começar a usar a plataforma. Mas o cadastro foi concluído no backend com sucesso!
              <br/><br/>
              <Link to="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>Ir para o Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="mock-alert" style={{ backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#f87171' }}>{error}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="João" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sobrenome</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="form-input" placeholder="Silva" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="seu@email.com" />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone (WhatsApp)</label>
                <input type="tel" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} required className="form-input" placeholder="(11) 90000-0000" />
              </div>

              {role === 'provider' && (
                <div className="form-group">
                  <label className="form-label">Especialidade Principal</label>
                  <select name="specialty" value={formData.specialty} onChange={handleChange} required className="form-input" style={{ backgroundColor: 'white' }}>
                    <option value="">Selecione um serviço...</option>
                    <option value="limpeza">Faxina / Limpeza</option>
                    <option value="eletricista">Eletricista</option>
                    <option value="encanador">Encanador</option>
                    <option value="montador">Montador de Móveis</option>
                    <option value="pintor">Pintor</option>
                    <option value="geral">Marido de Aluguel (Geral)</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Senha</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input" placeholder="Crie uma senha forte" />
              </div>

              <button type="submit" className="btn btn-primary auth-btn">
                {role === 'provider' ? 'Iniciar Processo de Verificação' : 'Criar minha Conta Segura'}
              </button>
            </form>
          )}

          <div className="form-footer">
            Já tem uma conta? <Link to="/login" className="auth-link">Entre aqui</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
