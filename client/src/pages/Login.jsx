import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Auth.css';

export default function Login() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-main">
        <div className="auth-card">
          <h2>Bem-vindo de volta!</h2>
          <p className="auth-subtitle">Acesse sua conta do EsponJÁ</p>

          {submitted ? (
            <div className="mock-alert">
              <strong>Simulação do MVP:</strong> Em um ambiente de produção, este login redirecionaria você para o seu Dashboard seguro. No momento, gravamos seu interesse!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" required className="form-input" placeholder="seu@email.com" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input type="password" required className="form-input" placeholder="••••••••" />
              </div>

              <button type="submit" className="btn btn-primary auth-btn">Entrar</button>
            </form>
          )}

          <div className="form-footer">
            Não tem uma conta? <Link to="/register" className="auth-link">Cadastre-se</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
