import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-badge">
          <ShieldCheck size={16} /> Profissionais 100% Verificados
        </div>
        
        <h1 className="hero-title">
          Contrate Profissionais <br />
          de <span>Confiança</span> com Tranquilidade
        </h1>
        
        <p className="hero-subtitle">
          Diga adeus à insegurança e aos serviços mal executados. O EsponJÁ conecta você com profissionais rigorosamente verificados. Qualidade garantida, zero risco.
        </p>
        
        <div className="hero-actions">
          <a href="#cta" className="btn btn-primary">Encontrar um Profissional</a>
          <a href="#how-it-works" className="btn btn-secondary">Veja Como Funciona</a>
        </div>
        
        <div className="hero-image-wrapper">
          <img 
            src="/hero-image.png" 
            alt="Profissional verificado e amigável dentro de uma casa moderna" 
            className="hero-image"
          />
          <div className="trust-floating-badge">
            <div className="icon-box">
              <Star fill="currentColor" size={24} />
            </div>
            <div className="trust-text">
              <h4>Mais Bem Avaliados</h4>
              <p>Baseado em mais de 500 avaliações</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
