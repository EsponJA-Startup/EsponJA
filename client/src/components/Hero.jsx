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
          Diga adeus à insegurança e às faxinas mal executadas. O EsponJÁ conecta você com profissionais de limpeza rigorosamente verificadas. Qualidade garantida, zero risco.
        </p>
        
        <div className="hero-actions">
          <a href="#cta" className="btn btn-primary">Encontrar um Profissional</a>
          <a href="#how-it-works" className="btn btn-secondary">Veja Como Funciona</a>
        </div>
        
      </div>
    </section>
  );
}
