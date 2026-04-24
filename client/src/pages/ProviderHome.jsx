import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, ShieldCheck, DollarSign, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react';
import './ProviderHome.css';

export default function ProviderHome() {
  const [activeTab, setActiveTab] = useState('agenda');

  const pendingRequests = [
    {
      id: 201,
      clientName: "Maria Eduarda",
      serviceType: "Limpeza Padrão",
      address: "Rua das Flores, 123",
      distance: "2 km",
      date: "28 de Abril, 14:00",
      value: "R$ 150,00"
    },
    {
      id: 202,
      clientName: "João Pedro",
      serviceType: "Limpeza Pós-obra",
      address: "Av. Paulista, 1000",
      distance: "5 km",
      date: "30 de Abril, 08:00",
      value: "R$ 400,00"
    }
  ];

  // Helper to generate a basic month calendar (May 2026 for example)
  const renderCalendar = () => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const dates = [];
    // Just mock 31 days, starting on a Friday
    for (let i = 0; i < 5; i++) dates.push(null); // empty slots for prev month
    for (let i = 1; i <= 31; i++) dates.push(i);

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="btn btn-sm btn-outline">&lt;</button>
          <h4>Maio 2026</h4>
          <button className="btn btn-sm btn-outline">&gt;</button>
        </div>
        <div className="calendar-grid">
          {days.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
          {dates.map((d, i) => (
            <div key={i} className={`calendar-cell ${d ? '' : 'empty'} ${d === 15 ? 'active-day' : ''} ${d === 18 ? 'booked-day' : ''}`}>
              {d && <span className="date-number">{d}</span>}
              {d === 15 && <div className="calendar-event">14:00 Limpeza</div>}
              {d === 18 && <div className="calendar-event">08:00 Pós-obra</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="provider-home">
      <Navbar />
      <main className="dashboard-content container">
        <header className="provider-header">
          <div className="provider-profile">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Ana Silva" className="provider-avatar" />
            <div className="provider-info">
              <h1>Olá, Ana! 👋</h1>
              <div className="provider-stats">
                <span className="stat"><Star size={16} fill="currentColor" className="text-accent" /> 4.9 Score de Confiança</span>
                <span className="stat badge-verified"><ShieldCheck size={16} /> Perfil Verificado</span>
              </div>
            </div>
          </div>
          
          <div className="wallet-summary">
            <div className="wallet-card">
              <span className="wallet-label">Disponível para Saque</span>
              <h3 className="wallet-amount">R$ 850,00</h3>
            </div>
            <div className="wallet-card escrow">
              <span className="wallet-label">Pagamentos Retidos (Escrow)</span>
              <h3 className="wallet-amount">R$ 300,00</h3>
              <small>Liberação em 24h após o serviço</small>
            </div>
          </div>
        </header>

        <div className="provider-tabs">
          <button 
            className={`tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <CalendarIcon size={18} /> Minha Agenda
          </button>
          <button 
            className={`tab-btn ${activeTab === 'solicitacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('solicitacoes')}
          >
            <Clock size={18} /> Solicitações Pendentes <span className="badge-count">2</span>
          </button>
        </div>

        {activeTab === 'agenda' && (
          <section className="agenda-section dashboard-card fade-in">
            <div className="card-header">
              <h3>Agendamento em Tempo Real</h3>
              <p className="text-light">Gerencie seus horários e visualize os serviços marcados.</p>
            </div>
            {renderCalendar()}
          </section>
        )}

        {activeTab === 'solicitacoes' && (
          <section className="requests-section dashboard-card fade-in">
            <div className="card-header">
              <h3>Novas Solicitações</h3>
              <p className="text-light">Clientes aguardando sua confirmação (Matching Inteligente).</p>
            </div>
            <div className="requests-list">
              {pendingRequests.map(req => (
                <div key={req.id} className="request-card">
                  <div className="req-header">
                    <h4>{req.serviceType}</h4>
                    <span className="req-value">{req.value}</span>
                  </div>
                  <div className="req-details">
                    <p><strong>Cliente:</strong> {req.clientName}</p>
                    <p><strong>Endereço:</strong> {req.address} ({req.distance})</p>
                    <p><strong>Data/Hora:</strong> {req.date}</p>
                  </div>
                  <div className="req-actions">
                    <button className="btn btn-outline btn-sm">Recusar</button>
                    <button className="btn btn-primary btn-sm"><CheckCircle size={16} /> Aceitar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
