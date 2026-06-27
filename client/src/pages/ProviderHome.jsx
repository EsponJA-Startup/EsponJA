import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, ShieldCheck, DollarSign, Calendar as CalendarIcon, CheckCircle, Clock, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import './ProviderHome.css';

export default function ProviderHome() {
  const [activeTab, setActiveTab] = useState('solicitacoes');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [professionalData, setProfessionalData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [profRes, reqsRes] = await Promise.all([
        api.get('/professionals/me'),
        api.get('/service-requests')
      ]);
      setProfessionalData(profRes.data);
      setRequests(reqsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

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
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Erro ao solicitar alteração.");
    }
  };

  const handleResolveProposal = async (proposalId, action) => {
    try {
      await api.post(`/reschedule-proposals/${proposalId}/${action}`);
      alert(action === 'accept' ? "Alteração de data/hora aceita!" : "Alteração recusada.");
      fetchDashboardData();
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
        fetchDashboardData();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || "Erro ao cancelar agendamento.");
      }
    }
  };

  const handleAcceptRequest = async (id) => {
    if (window.confirm("Você tem certeza que deseja aceitar este serviço?")) {
      try {
        await api.patch(`/service-requests/${id}`, {
          status: "Em Andamento",
          professional_id: localStorage.getItem('user_id')
        });
        alert("Serviço aceito com sucesso! Agora ele está na sua agenda.");
        fetchDashboardData();
        setActiveTab('agenda');
      } catch (error) {
        console.error("Erro ao aceitar o serviço:", error);
        alert("Ocorreu um erro ao aceitar o serviço.");
      }
    }
  };

  const handleRejectRequest = async (id) => {
    if (window.confirm("Você tem certeza que deseja recusar este serviço?")) {
      try {
        await api.post(`/service-requests/${id}/reject`);
        fetchDashboardData();
      } catch (error) {
        console.error("Erro ao recusar o serviço:", error);
        alert("Ocorreu um erro ao recusar o serviço.");
      }
    }
  };

  const handlePrevMonth = () => {
    setCalendarDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      return next;
    });
  };

  const renderCalendar = () => {
    const currentYear = calendarDate.getFullYear();
    const currentMonth = calendarDate.getMonth();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
    
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    const cells = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }
    
    const getDayServices = (d) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return scheduledRequests.filter(req => req.scheduled_date === dateStr);
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const today = new Date();
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      
      const dayServices = getDayServices(day);
      const hasServices = dayServices.length > 0;
      
      cells.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-cell ${isToday ? 'active-day' : ''}`}
          onClick={() => setSelectedDay(day)}
          style={{ cursor: 'pointer' }}
        >
          <span className={`date-number ${hasServices ? 'has-services' : ''}`}>
            {String(day).padStart(2, '0')}
          </span>
        </div>
      );
    }
    
    const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    
    return (
      <section className="calendar-section dashboard-card fade-in">
        <div className="card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <p className="text-light" style={{ fontSize: '0.95rem', margin: 0 }}>Visualização mensal dos seus compromissos.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={handlePrevMonth} 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '36px', height: '36px', padding: 0, border: '1px solid var(--border-color)', background: 'var(--white)', cursor: 'pointer' }}
              title="Mês anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--primary)', minWidth: '180px', textAlign: 'center', margin: 0 }}>
              {monthNames[currentMonth]} de {currentYear}
            </h3>
            <button 
              onClick={handleNextMonth} 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '36px', height: '36px', padding: 0, border: '1px solid var(--border-color)', background: 'var(--white)', cursor: 'pointer' }}
              title="Próximo mês"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="calendar-grid">
          {weekDays.map(d => (
            <div key={d} className="calendar-day-header">
              {d}
            </div>
          ))}
          {cells}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="provider-home">
        <Navbar />
        <main className="dashboard-content container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <h2>Carregando dashboard...</h2>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingRequests = requests.filter(req => req.status === 'Pendente');
  const scheduledRequests = requests.filter(req => req.status === 'Em Andamento');

  const fallbackName = localStorage.getItem('user_name') || 'Profissional';
  const firstName = professionalData ? professionalData.name.split(' ')[0] : fallbackName.split(' ')[0];
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=003366&color=fff&size=256`;

  return (
    <div className="provider-home">
      <Navbar />
      <main className="dashboard-content container">
        <header className="provider-header">
          <div className="provider-profile">
            <img src={avatarUrl} alt={firstName} className="provider-avatar" />
            <div className="provider-info">
              <h1>Olá, {firstName}! 👋</h1>
              <div className="provider-stats">
                <span className="stat"><Star size={16} fill="currentColor" className="text-accent" /> {professionalData?.rating || '5.0'} Score de Confiança</span>
                <span className="stat badge-verified"><ShieldCheck size={16} /> Perfil Verificado</span>
              </div>
            </div>
          </div>
          
          <div className="wallet-summary">
            <div className="wallet-card">
              <span className="wallet-label">Disponível para Saque</span>
              <h3 className="wallet-amount">R$ {(professionalData?.wallet_available || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="wallet-card escrow">
              <span className="wallet-label">Pagamentos Retidos (Escrow)</span>
              <h3 className="wallet-amount">R$ {(professionalData?.wallet_escrow || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
              <small>Liberação em 24h após o serviço</small>
            </div>
          </div>
        </header>

        <div className="provider-tabs">
          <button 
            className={`tab-btn ${activeTab === 'solicitacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('solicitacoes')}
          >
            <Clock size={18} /> Solicitações Pendentes {pendingRequests.length > 0 && <span className="badge-count">{pendingRequests.length}</span>}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            <CalendarIcon size={18} /> Minha Agenda {scheduledRequests.length > 0 && <span className="badge-count">{scheduledRequests.length}</span>}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'calendario' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendario')}
          >
            <CalendarIcon size={18} /> Calendário
          </button>
        </div>

        {activeTab === 'agenda' && (
          <section className="agenda-section dashboard-card fade-in">
            <div className="card-header">
              <h3>Agendamento em Tempo Real</h3>
              <p className="text-light">Serviços que você aceitou e estão em andamento.</p>
            </div>
            
            <div className="requests-list">
              {scheduledRequests.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>
                  Sua agenda está vazia no momento.
                </p>
              ) : (
                scheduledRequests.map(req => {
                  const isPast = (() => {
                    if (!req.scheduled_date) return false;
                    const [year, month, day] = req.scheduled_date.split('-').map(Number);
                    const [hours, minutes] = (req.scheduled_time || '00:00').split(':').map(Number);
                    const serviceDate = new Date(year, month - 1, day, hours, minutes);
                    return new Date() >= serviceDate;
                  })();

                  const canCancelOrChange = !isPast && (() => {
                    const [y, m, d] = req.scheduled_date.split('-').map(Number);
                    const [h, min] = (req.scheduled_time || '00:00').split(':').map(Number);
                    const serviceDate = new Date(y, m - 1, d, h, min);
                    return serviceDate - new Date() >= 24 * 60 * 60 * 1000;
                  })();

                  const pending = req.pending_reschedule;

                  return (
                    <div key={req.id} className="request-card" style={{ borderLeft: '4px solid var(--primary)', opacity: isPast ? 0.75 : 1 }}>
                      <div className="req-header">
                        <h4>{req.service_type}</h4>
                        <span className="req-value" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                          {req.price ? `R$ ${parseFloat(req.price).toFixed(2)}` : 'A Combinar'}
                        </span>
                      </div>
                      <div className="req-details">
                        <p><strong>Tipo de Imóvel:</strong> {req.home_type} ({req.bedrooms} quartos, {req.bathrooms} banheiros)</p>
                        <p><strong>Endereço:</strong> {req.address} - CEP: {req.cep}</p>
                        <p><strong>Data/Hora:</strong> {req.scheduled_date} às {req.scheduled_time?.substring(0, 5) || 'A definir'}</p>
                      </div>

                      {pending && (
                        pending.requested_by_role === 'customer' ? (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef9c3', borderLeft: '4px solid var(--accent, #facc15)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#713f12', marginBottom: '0.25rem' }}>
                              <AlertTriangle size={14} className="text-accent" />
                              <span>Alteração Sugerida pelo Cliente</span>
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
                              <strong>Sugestão de alteração enviada:</strong> {pending.proposed_date} às {pending.proposed_time.substring(0, 5)} (Aguardando resposta do cliente).
                            </p>
                          </div>
                        )
                      )}

                      {reschedulingId === req.id && (
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
                            <button className="btn btn-primary btn-sm" onClick={() => submitReschedule(req.id)}>Enviar Sugestão</button>
                          </div>
                        </div>
                      )}

                      {canCancelOrChange && !pending && reschedulingId !== req.id && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button 
                            onClick={() => { setReschedulingId(req.id); setRescheduleDate(""); setRescheduleTime(""); }} 
                            className="btn btn-outline btn-sm" 
                            style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem' }}
                          >
                            Sugerir Alteração
                          </button>
                          <button 
                            onClick={() => handleCancelRequest(req.id)} 
                            className="btn btn-danger btn-sm" 
                            style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }}
                          >
                            Cancelar Serviço
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {activeTab === 'solicitacoes' && (
          <section className="requests-section dashboard-card fade-in">
            <div className="card-header">
              <h3>Novas Solicitações</h3>
              <p className="text-light">Clientes aguardando sua confirmação (Matching Inteligente).</p>
            </div>
            <div className="requests-list">
              {pendingRequests.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>
                  Nenhuma solicitação pendente no momento.
                </p>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="request-card">
                    <div className="req-header">
                      <h4>{req.service_type}</h4>
                      <span className="req-value">A Combinar</span>
                    </div>
                    <div className="req-details">
                      <p><strong>Tipo de Imóvel:</strong> {req.home_type} ({req.bedrooms} quartos, {req.bathrooms} banheiros)</p>
                      <p><strong>Endereço:</strong> {req.address} - CEP: {req.cep}</p>
                      <p><strong>Data/Hora:</strong> {req.scheduled_date} às {req.scheduled_time?.substring(0, 5) || 'A definir'}</p>
                    </div>
                    <div className="req-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => handleRejectRequest(req.id)}>Recusar</button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(req.id)}>
                        <CheckCircle size={16} /> Aceitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'calendario' && renderCalendar()}

        {selectedDay !== null && (
          <div className="modal-overlay" onClick={() => { setSelectedDay(null); setSelectedService(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
              <button 
                onClick={() => { setSelectedDay(null); setSelectedService(null); }} 
                className="modal-close-btn"
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
              >
                <X size={20} />
              </button>
              
              {selectedService === null ? (
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Serviços em {String(selectedDay).padStart(2, '0')}/{String(calendarDate.getMonth() + 1).padStart(2, '0')}/{calendarDate.getFullYear()}
                  </h3>
                  
                  {scheduledRequests.filter(req => {
                    const localDateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                    return req.scheduled_date === localDateStr;
                  }).length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
                      <CalendarIcon size={40} className="text-light" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--text-light)', textAlign: 'center', fontSize: '0.95rem' }}>
                        Não há serviços agendados para este dia.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {scheduledRequests
                        .filter(req => {
                          const localDateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                          return req.scheduled_date === localDateStr;
                        })
                        .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                        .map(req => (
                          <div 
                            key={req.id} 
                            onClick={() => setSelectedService(req)}
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              padding: '1rem', 
                              backgroundColor: 'var(--bg-secondary)', 
                              borderLeft: '4px solid #10b981', 
                              borderRadius: 'var(--radius-md)', 
                              cursor: 'pointer'
                            }}
                            className="calendar-mini-card"
                          >
                            <div>
                              <h4 style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.95rem' }}>{req.service_type}</h4>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                Horário: {req.scheduled_time.substring(0, 5)}
                              </p>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>
                              {req.price ? `R$ ${parseFloat(req.price).toFixed(2)}` : 'A Combinar'}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button 
                      onClick={() => setSelectedService(null)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0 }}
                      title="Voltar para a lista"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                      Detalhes do Serviço
                    </h3>
                  </div>
                  
                  <div className="request-card" style={{ borderLeft: '4px solid var(--primary)', margin: 0, padding: '1rem' }}>
                    <div className="req-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedService.service_type}</h4>
                      <span className="req-value" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem' }}>
                        {selectedService.price ? `R$ ${parseFloat(selectedService.price).toFixed(2)}` : 'A Combinar'}
                      </span>
                    </div>
                    <div className="req-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <p><strong>Tipo de Imóvel:</strong> {selectedService.home_type} ({selectedService.bedrooms} quartos, {selectedService.bathrooms} banheiros)</p>
                      <p><strong>Endereço:</strong> {selectedService.address} - CEP: {selectedService.cep}</p>
                      <p><strong>Data/Hora:</strong> {selectedService.scheduled_date} às {selectedService.scheduled_time?.substring(0, 5) || 'A definir'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
