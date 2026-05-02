import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import './ServiceRequest.css';

export default function ServiceRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialService = queryParams.get("type") || "Limpeza Padrão";

  const [formData, setFormData] = useState({
    serviceType: initialService,
    homeType: 'apartamento',
    bedrooms: '2',
    bathrooms: '1',
    hasPets: 'nao',
    cep: '',
    address: '',
    date: '',
    time: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      alert("Você precisa estar logado para solicitar um serviço.");
      navigate('/login');
      return;
    }

    try {
      await api.post('/service-requests', {
        client_id: userId,
        service_type: formData.serviceType,
        home_type: formData.homeType,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        has_pets: formData.hasPets === 'sim',
        cep: formData.cep,
        address: formData.address,
        scheduled_date: formData.date,
        scheduled_time: formData.time + ":00" // Backend expects valid time string (HH:MM:SS)
      });
      alert("Solicitação enviada com sucesso!");
      navigate('/client/home');
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar solicitação. Tente novamente.");
    }
  };

  return (
    <div className="service-request-page">
      <Navbar />
      <main className="request-main container">
        <div className="request-header">
          <h2>Detalhes do Serviço</h2>
          <p>Preencha os dados abaixo para encontrarmos o profissional ideal para sua {formData.serviceType}.</p>
        </div>

        <form className="request-form dashboard-card" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>1. Sobre o Imóvel</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Imóvel</label>
                <select name="homeType" value={formData.homeType} onChange={handleChange} className="form-input">
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="comercial">Sala Comercial</option>
                </select>
              </div>
            </div>

            <div className="form-row split">
              <div className="form-group">
                <label className="form-label">Quartos</label>
                <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="form-input">
                  <option value="1">1 Quarto</option>
                  <option value="2">2 Quartos</option>
                  <option value="3">3 Quartos</option>
                  <option value="4+">4+ Quartos</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Banheiros</label>
                <select name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="form-input">
                  <option value="1">1 Banheiro</option>
                  <option value="2">2 Banheiros</option>
                  <option value="3">3 Banheiros</option>
                  <option value="4+">4+ Banheiros</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Possui animais de estimação?</label>
                <select name="hasPets" value={formData.hasPets} onChange={handleChange} className="form-input">
                  <option value="nao">Não</option>
                  <option value="sim">Sim (Cachorro/Gato)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>2. Endereço e Agendamento</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CEP</label>
                <input type="text" name="cep" value={formData.cep} onChange={handleChange} className="form-input" placeholder="00000-000" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Endereço Completo</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-input" placeholder="Rua, Número, Complemento" required />
              </div>
            </div>

            <div className="form-row split">
              <div className="form-group">
                <label className="form-label">Data Preferencial</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Horário Preferencial</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} className="form-input" required />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/client/home')}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Encontrar Profissionais</button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
