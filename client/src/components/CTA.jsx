import React, { useState } from 'react';
import api from '../services/api';
import './CTA.css';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [intendedRole, setIntendedRole] = useState('customer');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (email) {
      try {
        await api.post('/waitlist', { email, intended_role: intendedRole });
        setSubmitted(true);
        setEmail('');
      } catch (err) {
        if (err.response && err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Ocorreu um erro ao entrar na lista de espera. Tente novamente.");
        }
      }
    }
  };

  return (
    <section id="cta" className="cta-section">
      <div className="container cta-container">
        <h2>Pronto para transformar como você encontra ajuda para o lar?</h2>
        <p>Entre para a lista de espera hoje. Seja um dos primeiros a experimentar serviços domésticos livres de risco, confiáveis e verificados.</p>

        {submitted ? (
          <div className="form-success">
            <h4>Você está na lista!</h4>
            <p>Fique de olho na sua caixa de entrada. Avisaremos quando o EsponJÁ estiver disponível na sua área.</p>
          </div>
        ) : (
          <form className="waitlist-form" onSubmit={handleSubmit}>
            <select 
              className="waitlist-input"
              value={intendedRole}
              onChange={(e) => setIntendedRole(e.target.value)}
              style={{ width: '150px', backgroundColor: 'white' }}
            >
              <option value="customer">Contratar</option>
              <option value="provider">Trabalhar</option>
            </select>
            <input 
              type="email" 
              placeholder="Digite seu endereço de e-mail" 
              className="waitlist-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit" className="waitlist-btn">Entrar na Fila</button>
            {error && <p style={{ color: 'white', marginTop: '10px', fontSize: '14px', width: '100%', textAlign: 'center' }}>{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
