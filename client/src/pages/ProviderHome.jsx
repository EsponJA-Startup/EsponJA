import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, ShieldCheck, DollarSign, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import './ProviderHome.css';

export default function ProviderHome() {
  const [activeTab, setActiveTab] = useState('solicitacoes');
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
                scheduledRequests.map(req => (
                  <div key={req.id} className="request-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="req-header">
                      <h4>{req.service_type}</h4>
                      <span className="req-value" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>A Combinar</span>
                    </div>
                    <div className="req-details">
                      <p><strong>Tipo de Imóvel:</strong> {req.home_type} ({req.bedrooms} quartos, {req.bathrooms} banheiros)</p>
                      <p><strong>Endereço:</strong> {req.address} - CEP: {req.cep}</p>
                      <p><strong>Data/Hora:</strong> {req.scheduled_date} às {req.scheduled_time?.substring(0, 5) || 'A definir'}</p>
                    </div>
                  </div>
                ))
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

      </main>
      <Footer />
    </div>
  );
}
