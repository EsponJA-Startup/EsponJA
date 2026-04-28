import React from 'react';
import { Search, FileText, CalendarCheck, Smile } from 'lucide-react';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      icon: <Search size={36} />,
      title: 'Busca Rápida',
      description: 'Encontre rapidamente diaristas disponíveis para a sua faxina em um sistema centralizado.'
    },
    {
      num: 2,
      icon: <FileText size={36} />,
      title: 'Verifique os Perfis',
      description: 'Cheque históricos transparentes, identidades verificadas e avaliações reais para construir confiança antes de contratar.'
    },
    {
      num: 3,
      icon: <CalendarCheck size={36} />,
      title: 'Agende com Segurança',
      description: 'Agende o serviço com apenas alguns cliques. Confirmamos ativamente o compromisso para garantir que as faltas sejam penalizadas.'
    },
    {
      num: 4,
      icon: <Smile size={36} />,
      title: 'Relaxe',
      description: 'Desfrute de uma casa limpa e cheirosa. Se surgir algum problema, nossa garantia de refação e suporte ativo cobrem você.'
    }
  ];

  return (
    <section id="how-it-works" className="section how-it-works">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Sua Casa Limpa em 4 Passos</h2>
          <p className="section-subtitle">
            Um processo de agendamento simples, rápido e seguro.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-number">{step.num}</div>
              <div className="step-icon">
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
