import React from 'react';
import { UserCheck, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import './Features.css';

export default function Features() {
  const features = [
    {
      icon: <UserCheck size={32} />,
      title: 'Verificação de Identidade',
      description: 'Todo profissional passa por uma rigorosa checagem de antecedentes e verificação de identidade antes de entrar na plataforma.'
    },
    {
      icon: <Clock size={32} />,
      title: 'Confirmação Ativa',
      description: 'Confirmamos ativamente os agendamentos e penalizamos rigorosamente as faltas. Garantimos que eles apareçam quando prometido.'
    },
    {
      icon: <ShieldAlert size={32} />,
      title: 'Avaliações Verificadas',
      description: '100% das avaliações são de usuários reais. Veja históricos de desempenho transparentes antes de contratar.'
    },
    {
      icon: <Sparkles size={32} />,
      title: 'Garantia de Refação',
      description: 'Se o serviço for mal executado ou incompleto, garantimos a refação ou fornecemos suporte imediato.'
    }
  ];

  return (
    <section id="features" className="section features">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Sua Segurança é Nossa Prioridade</h2>
          <p className="section-subtitle">
            Eliminamos os riscos da contratação informal. Chega de insegurança, chega de perder tempo.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
