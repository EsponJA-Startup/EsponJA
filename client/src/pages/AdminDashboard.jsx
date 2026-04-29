import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [requests, setRequests] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('requests');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/admin-login', { password });
      setIsAuthenticated(true);
      fetchData();
    } catch (err) {
      setError('Senha incorreta.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const reqRes = await api.get('/service-requests');
      setRequests(reqRes.data);
      
      const proRes = await api.get('/professionals');
      setProfessionals(proRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/service-requests/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Erro ao atualizar status");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <Navbar />
        <main className="admin-login-main container">
          <div className="admin-card">
            <h2>Acesso Restrito</h2>
            <p>Dashboard de Administração Interna</p>
            <form onSubmit={handleLogin}>
              {error && <div className="mock-alert error">{error}</div>}
              <div className="form-group">
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Senha Administrativa" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Entrar</button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-dashboard-main container">
        <div className="admin-header">
          <h2>Admin Dashboard</h2>
          <div className="admin-tabs">
            <button 
              className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('requests')}
            >
              Solicitações
            </button>
            <button 
              className={`btn ${activeTab === 'professionals' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('professionals')}
            >
              Catálogo de Profissionais
            </button>
            <button className="btn btn-secondary" onClick={() => fetchData()}>
              Atualizar Dados
            </button>
          </div>
        </div>

        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="admin-content dashboard-card">
            {activeTab === 'requests' && (
              <div className="table-responsive">
                <h3>Solicitações de Serviço ({requests.length})</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Serviço</th>
                      <th>Endereço</th>
                      <th>Data/Hora</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan="6" style={{textAlign: 'center'}}>Nenhuma solicitação encontrada</td></tr>
                    ) : requests.map(req => (
                      <tr key={req.id}>
                        <td>{req.id.substring(0, 8)}...</td>
                        <td>{req.service_type}</td>
                        <td>{req.address} - {req.cep}</td>
                        <td>{req.scheduled_date} às {req.scheduled_time}</td>
                        <td>
                          <span className={`status-badge ${req.status === 'Pendente' ? 'warning' : 'success'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <select 
                            className="form-input" 
                            style={{padding: '4px 8px', fontSize: '14px', height: 'auto'}}
                            value={req.status}
                            onChange={(e) => updateStatus(req.id, e.target.value)}
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'professionals' && (
              <div className="table-responsive">
                <h3>Profissionais Cadastrados ({professionals.length})</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Especialidade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.length === 0 ? (
                      <tr><td colSpan="6" style={{textAlign: 'center'}}>Nenhum profissional encontrado</td></tr>
                    ) : professionals.map(pro => (
                      <tr key={pro.id}>
                        <td>{pro.id.substring(0, 8)}...</td>
                        <td>{pro.name}</td>
                        <td>{pro.email}</td>
                        <td>{pro.whatsapp_number}</td>
                        <td>{pro.specialty || 'Não informado'}</td>
                        <td>
                          <span className={`status-badge ${pro.is_verified ? 'success' : 'warning'}`}>
                            {pro.is_verified ? 'Verificado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
