import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, MapPin, Calendar, Clock, ShieldCheck, History, AlertTriangle } from 'lucide-react';
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
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const isServicePast = (dateStr, timeStr) => {
    if (!dateStr) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
    const serviceDate = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    return now >= serviceDate;
  };

  const submitReschedule = async (id) => {
    if (!rescheduleDate || !rescheduleTime) {
      alert("Por favor, selecione data e hora para a alteração.");
      return;
    }
    try {
      await api.post(`/service-requests/${id}/reschedule-proposals`, {
        proposed_date: rescheduleDate,
        proposed_time: rescheduleTime
      });
      alert("Sugestão de alteração enviada com sucesso!");
      setReschedulingId(null);
      const response = await api.get('/service-requests');
      setMyAppointments(response.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Erro ao solicitar alteração.");
    }
  };

  const handleResolveProposal = async (proposalId, action) => {
    try {
      await api.post(`/reschedule-proposals/${proposalId}/${action}`);
      alert(action === 'accept' ? "Alteração de data/hora aceita!" : "Alteração recusada.");
      const response = await api.get('/service-requests');
      setMyAppointments(response.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao responder à sugestão.");
    }
  };

  const handleCancelRequest = async (id) => {
    if (window.confirm("Você tem certeza que deseja cancelar este agendamento?")) {
      try {
        await api.post(`/service-requests/${id}/cancel`);
        alert("Agendamento cancelado com sucesso.");
        const response = await api.get('/service-requests');
        setMyAppointments(response.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || "Erro ao cancelar agendamento.");
      }
    }
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
    ? myAppointments.filter(appt => appt.status !== 'Cancelado')
    : myAppointments.filter(appt => appt.status !== 'Concluído' && appt.status !== 'Cancelado' && !isServicePast(appt.scheduled_date, appt.scheduled_time));

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
                  const canCancelOrChange = !isPast && appt.status !== 'Cancelado' && (() => {
                    const [y, m, d] = appt.scheduled_date.split('-').map(Number);
                    const [h, min] = (appt.scheduled_time || '00:00').split(':').map(Number);
                    const serviceDate = new Date(y, m - 1, d, h, min);
                    return serviceDate - new Date() >= 24 * 60 * 60 * 1000;
                  })();
                  const pending = appt.pending_reschedule;

                  return (
                    <div key={appt.id} className="appointment-card" style={{ opacity: isPast ? 0.75 : 1 }}>
                      <div className="appt-header">
                        <h4>{appt.service_type}</h4>
                        <span className={`status-badge ${appt.status === 'Concluído' ? 'success' : (appt.status === 'Cancelado' ? 'danger' : (isPast ? 'expired' : 'pending'))}`} style={{ backgroundColor: appt.status === 'Cancelado' ? '#fee2e2' : (isPast && appt.status !== 'Concluído' ? '#e2e8f0' : undefined), color: appt.status === 'Cancelado' ? '#ef4444' : (isPast && appt.status !== 'Concluído' ? '#64748b' : undefined) }}>
                          {appt.status === 'Concluído' ? 'Concluído' : (appt.status === 'Cancelado' ? 'Cancelado' : (isPast ? 'Realizado' : appt.status))}
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

                      {pending && (
                        pending.requested_by_role === 'provider' ? (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef9c3', borderLeft: '4px solid var(--accent, #facc15)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#713f12', marginBottom: '0.25rem' }}>
                              <AlertTriangle size={14} className="text-accent" />
                              <span>Alteração Sugerida pelo Profissional</span>
                            </div>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#713f12' }}>
                              Nova data sugerida: <strong>{pending.proposed_date}</strong> às <strong>{pending.proposed_time.substring(0, 5)}</strong>.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button className="btn btn-sm" style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleResolveProposal(pending.id, 'reject')}>Recusar</button>
                              <button className="btn btn-sm" style={{ backgroundColor: '#dcfce7', color: '#15803d', border: 'none', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleResolveProposal(pending.id, 'accept')}>Aceitar</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f1f5f9', borderLeft: '4px solid #94a3b8', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#475569' }}>
                            <p style={{ margin: 0 }}>
                              <strong>Sugestão de alteração enviada:</strong> {pending.proposed_date} às {pending.proposed_time.substring(0, 5)} (Aguardando resposta do profissional).
                            </p>
                          </div>
                        )
                      )}

                      {reschedulingId === appt.id && (
                        <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sugerir Nova Data/Hora:</p>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            <input 
                              type="date" 
                              value={rescheduleDate} 
                              onChange={(e) => setRescheduleDate(e.target.value)} 
                              className="form-input" 
                              style={{ padding: '0.4rem', fontSize: '0.85rem', flex: 1 }}
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <input 
                              type="time" 
                              value={rescheduleTime} 
                              onChange={(e) => setRescheduleTime(e.target.value)} 
                              className="form-input" 
                              style={{ padding: '0.4rem', fontSize: '0.85rem', flex: 1 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setReschedulingId(null)}>Cancelar</button>
                            <button className="btn btn-primary btn-sm" onClick={() => submitReschedule(appt.id)}>Enviar Sugestão</button>
                          </div>
                        </div>
                      )}

                      {!isPast && appt.status !== 'Cancelado' && (
                        <div className="appt-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                          {canCancelOrChange && !pending && reschedulingId !== appt.id && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button 
                                onClick={() => { setReschedulingId(appt.id); setRescheduleDate(""); setRescheduleTime(""); }} 
                                className="btn btn-outline btn-sm" 
                                style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem' }}
                              >
                                Sugerir Alteração
                              </button>
                              <button 
                                onClick={() => handleCancelRequest(appt.id)} 
                                className="btn btn-danger btn-sm" 
                                style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }}
                              >
                                Cancelar Serviço
                              </button>
                            </div>
                          )}
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
