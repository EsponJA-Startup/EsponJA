import React, { useState } from 'react';
import './CTA.css';

export default function CTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Simulate API call
      setTimeout(() => {
        setEmail('');
      }, 1000);
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
            <input 
              type="email" 
              placeholder="Digite seu endereço de e-mail" 
              className="waitlist-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit" className="waitlist-btn">Entrar na Fila</button>
          </form>
        )}
      </div>
    </section>
  );
}
