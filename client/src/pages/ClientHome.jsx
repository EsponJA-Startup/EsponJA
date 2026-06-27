import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, MapPin, Calendar, Clock, ShieldCheck, Edit, Trash2, History } from 'lucide-react';
import api from '../services/api';
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

  const [myAppointments, setMyAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const isServicePast = (dateStr, timeStr) => {
    if (!dateStr) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
    const serviceDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    return now >= serviceDate;
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/service-requests');
        setMyAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    
    const fetchProfessionals = async () => {
      try {
        const response = await api.get('/professionals');
        setProfessionals(response.data);
      } catch (err) {
        console.error("Error fetching professionals:", err);
      }
    };

    fetchAppointments();
    fetchProfessionals();
  }, []);

  const normalizeString = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const getWeightedRating = (pro) => {
    const v = pro.review_count || 0;
    const R = pro.rating || 0;
    const C = 4.0; // Baseline rating
    const m = 10;  // Weight multiplier
    return (v * R + m * C) / (v + m);
  };

  const normalizedQuery = normalizeString(searchQuery);

  const filteredPros = professionals
    .filter(pro => 
      normalizeString(pro.name).includes(normalizedQuery) || 
      (pro.specialty && normalizeString(pro.specialty).includes(normalizedQuery))
    )
    .sort((a, b) => {
      const weightA = getWeightedRating(a);
      const weightB = getWeightedRating(b);
      
      if (Math.abs(weightB - weightA) > 0.0001) {
        return weightB - weightA;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5);

  const displayedAppointments = showHistory 
    ? myAppointments 
    : myAppointments.filter(appt => appt.status !== 'Concluído' && !isServicePast(appt.scheduled_date, appt.scheduled_time));

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      try {
        await api.delete(`/service-requests/${id}`);
        setMyAppointments(prev => prev.filter(appt => appt.id !== id));
      } catch (err) {
        console.error("Error deleting appointment:", err);
        alert("Erro ao excluir o pedido.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/client/request-service?edit=${id}`);
  };

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
              <h3>Buscar Prestadores de Serviço</h3>
            </div>
            <p className="section-desc">Pesquise por nome ou especialidade e escolha um prestador para agendar.</p>
            
            <div className="search-container" style={{ marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou especialidade..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
              />
            </div>
            
            <div className="pros-list">
              {filteredPros.length === 0 ? (
                <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '1.5rem 0' }}>
                  Nenhum prestador encontrado.
                </p>
              ) : (
                filteredPros.map(pro => {
                  const avatarUrl = pro.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.name)}&background=003366&color=fff&size=256`;
                  return (
                    <div key={pro.id} className="pro-card">
                      <img src={avatarUrl} alt={pro.name} className="pro-avatar" />
                      <div className="pro-info">
                        <h4>{pro.name}</h4>
                        <div className="pro-meta">
                          <span className="rating"><Star size={14} fill="currentColor" /> {pro.rating.toFixed(1)} ({pro.review_count})</span>
                          {pro.specialty && <span className="specialty" style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginLeft: '10px' }}>• {pro.specialty}</span>}
                        </div>
                        <div className="pro-badges">
                          {pro.badges && pro.badges.map((badge, idx) => (
                            <span key={idx} className="badge-outline">{badge}</span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/client/request-service?professional_id=${pro.id}`)}
                        className="btn btn-primary btn-sm"
                      >
                        Agendar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="appointments-section dashboard-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{showHistory ? "Histórico de Serviços" : "Meus Agendamentos"}</h3>
              <button 
                onClick={() => setShowHistory(!showHistory)} 
                className={`btn btn-sm ${showHistory ? 'btn-primary' : 'btn-outline'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)' }}
                title={showHistory ? "Ver Agendamentos Ativos" : "Ver Histórico Completo"}
              >
                <History size={16} />
                {showHistory ? "Ativos" : "Histórico"}
              </button>
            </div>
            <div className="appointments-list">
              {displayedAppointments.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
                  {showHistory ? "Seu histórico está vazio." : "Nenhum agendamento ativo."}
                </p>
              ) : (
                displayedAppointments.map(appt => {
                  const isPast = appt.status === 'Concluído' || isServicePast(appt.scheduled_date, appt.scheduled_time);
                  return (
                    <div key={appt.id} className="appointment-card" style={{ opacity: isPast ? 0.75 : 1 }}>
                      <div className="appt-header">
                        <h4>{appt.service_type}</h4>
                        <span className={`status-badge ${appt.status === 'Concluído' ? 'success' : (isPast ? 'expired' : 'pending')}`} style={{ backgroundColor: isPast && appt.status !== 'Concluído' ? '#e2e8f0' : undefined, color: isPast && appt.status !== 'Concluído' ? '#64748b' : undefined }}>
                          {appt.status === 'Concluído' ? 'Concluído' : (isPast ? 'Realizado' : appt.status)}
                        </span>
                      </div>
                      <p className="appt-pro">
                        com <strong>{appt.professional_name ? appt.professional_name : (appt.professional_id ? "Profissional Atribuído" : "Aguardando Profissional")}</strong>
                      </p>
                      <div className="appt-details">
                        <span><Calendar size={16} /> {appt.scheduled_date}</span>
                        <span><Clock size={16} /> {appt.scheduled_time}</span>
                      </div>
                      <div className="appt-payment">
                        <ShieldCheck size={18} className="shield-icon" />
                        <span>{appt.payment_status}</span>
                      </div>
                      {!isPast && (
                        <div className="appt-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button onClick={() => handleEdit(appt.id)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Edit size={14} /> Editar
                          </button>
                          <button onClick={() => handleDelete(appt.id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }}>
                            <Trash2 size={14} /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
