import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(location.state?.intended_role || 'customer');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const isDebug = queryParams.get('debug') === 'true';

  useEffect(() => {
    if (isDebug) return;
    if (!location.state || !location.state.waitlist_id) {
      navigate('/primeiro-acesso');
    }
  }, [location, navigate, isDebug]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: location.state?.email || '',
    whatsapp_number: location.state?.phone || '',
    specialty: '',
    password: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== confirmPassword) {
      setError('As senhas não coincidem. Por favor, verifique os campos.');
      return;
    }
    try {
      const payload = { 
        ...formData, 
        role,
        waitlist_id: location.state?.waitlist_id,
        first_access_password: location.state?.first_access_password
      };
      const response = await api.post('/auth/register', payload);
      
      // Save to localStorage
      if (response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id);
      }
      localStorage.setItem('user_role', response.data.role);

      setSubmitted(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // It's a validation error from Pydantic (e.g. password too weak)
          setError(detail[0].msg.replace('Value error, ', ''));
        } else {
          setError(detail);
        }
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



          {submitted ? (
            <div className="mock-alert">
              <strong>Cadastro realizado com sucesso!</strong>
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
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className={`form-input ${formData.password && confirmPassword ? (formData.password === confirmPassword ? 'input-success' : 'input-error') : ''}`} 
                  placeholder="Crie uma senha forte" 
                />
                <span className="password-requirements">
                  A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula e um número.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Repita sua senha</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className={`form-input ${formData.password && confirmPassword ? (formData.password === confirmPassword ? 'input-success' : 'input-error') : ''}`} 
                  placeholder="Digite a senha novamente" 
                />
                {formData.password && confirmPassword && (
                  <div className={`password-match-indicator ${formData.password === confirmPassword ? 'match' : 'no-match'}`}>
                    {formData.password === confirmPassword ? '✓ As senhas coincidem' : '✗ As senhas não coincidem'}
                  </div>
                )}
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
