import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import './ClientHome.css';

export default function ClientHome() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState("");

  const handleServiceSelect = (e) => {
    const service = e.target.value;
    setSelectedService(service);
    if (service) {
      navigate(`/client/request-service?type=${encodeURIComponent(service)}`);
    }
  };

  const recommendedPros = [
    {
      id: 1,
      name: "Ana Silva",
      rating: 4.9,
      reviews: 124,
      distance: "2.5 km",
      badges: ["Top Pro", "Verificada"],
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 2,
      name: "Carlos Mendes",
      rating: 4.8,
      reviews: 89,
      distance: "3.1 km",
      badges: ["Limpeza Pesada", "Verificado"],
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 3,
      name: "Juliana Costa",
      rating: 5.0,
      reviews: 42,
      distance: "1.8 km",
      badges: ["Rápida", "Verificada"],
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  const myAppointments = [
    {
      id: 101,
      proName: "Fernanda Lima",
      serviceType: "Limpeza Padrão",
      date: "28 de Abril, 2026",
      time: "14:00",
      status: "Confirmado",
      paymentStatus: "Pagamento Protegido (Escrow)"
    }
  ];

  return (
    <div className="client-home">
      <Navbar />
      <main className="dashboard-content container">
        <header className="dashboard-header">
          <div>
            <h1>Olá, Cliente! 👋</h1>
            <p className="text-light">O que sua casa precisa hoje?</p>
          </div>
        </header>

        <section className="request-service-section">
          <div className="service-dropdown-container">
            <h3>Solicitar Novo Serviço</h3>
            <p>Selecione o tipo de limpeza para começarmos:</p>
            <select 
              className="service-select form-input" 
              value={selectedService} 
              onChange={handleServiceSelect}
            >
              <option value="" disabled>Escolha um serviço...</option>
              <option value="Limpeza Rápida">Limpeza Rápida</option>
              <option value="Limpeza Padrão">Limpeza Padrão</option>
              <option value="Limpeza Pesada">Limpeza Pesada</option>
              <option value="Limpeza Pós-obra">Limpeza Pós-obra</option>
              <option value="Limpeza Pré-mudança">Limpeza Pré-mudança</option>
            </select>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="matching-section dashboard-card">
            <div className="card-header">
              <h3>Profissionais Recomendados</h3>
              <span className="badge-smart">Matching Inteligente</span>
            </div>
            <p className="section-desc">Baseado na sua localização e avaliações.</p>
            
            <div className="pros-list">
              {recommendedPros.map(pro => (
                <div key={pro.id} className="pro-card">
                  <img src={pro.image} alt={pro.name} className="pro-avatar" />
                  <div className="pro-info">
                    <h4>{pro.name}</h4>
                    <div className="pro-meta">
                      <span className="rating"><Star size={14} fill="currentColor" /> {pro.rating} ({pro.reviews})</span>
                      <span className="distance"><MapPin size={14} /> {pro.distance}</span>
                    </div>
                    <div className="pro-badges">
                      {pro.badges.map((badge, idx) => (
                        <span key={idx} className="badge-outline">{badge}</span>
                      ))}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm">Ver Perfil</button>
                </div>
              ))}
            </div>
          </section>

          <section className="appointments-section dashboard-card">
            <h3>Meus Agendamentos</h3>
            <div className="appointments-list">
              {myAppointments.map(appt => (
                <div key={appt.id} className="appointment-card">
                  <div className="appt-header">
                    <h4>{appt.serviceType}</h4>
                    <span className="status-badge success">{appt.status}</span>
                  </div>
                  <p className="appt-pro">com <strong>{appt.proName}</strong></p>
                  <div className="appt-details">
                    <span><Calendar size={16} /> {appt.date}</span>
                    <span><Clock size={16} /> {appt.time}</span>
                  </div>
                  <div className="appt-payment">
                    <ShieldCheck size={18} className="shield-icon" />
                    <span>{appt.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
