import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { Save, User, Phone, Briefcase, Link } from 'lucide-react';
import './ProviderProfile.css';

export default function ProviderProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    whatsapp_number: '',
    specialty: '',
    profile_picture_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/professionals/me');
        setProfile({
          name: response.data.name || '',
          whatsapp_number: response.data.whatsapp_number || '',
          specialty: response.data.specialty || '',
          profile_picture_url: response.data.profile_picture_url || ''
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Não foi possível carregar seu perfil.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await api.patch('/professionals/me', profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Erro ao atualizar o perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="provider-profile-page">
        <Navbar />
        <main className="dashboard-content container">
          <p>Carregando perfil...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="provider-profile-page">
      <Navbar />
      <main className="dashboard-content container">
        <header className="profile-header">
          <h1>Meu Perfil</h1>
          <button className="btn btn-outline" onClick={() => navigate('/provider/home')}>
            Voltar ao Dashboard
          </button>
        </header>

        <section className="profile-section dashboard-card fade-in">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">Perfil atualizado com sucesso!</div>}
          
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label><User size={16} /> Nome Completo</label>
              <input 
                type="text" 
                name="name"
                className="form-input" 
                value={profile.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label><Phone size={16} /> Número do WhatsApp</label>
              <input 
                type="text" 
                name="whatsapp_number"
                className="form-input" 
                value={profile.whatsapp_number} 
                onChange={handleChange} 
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label><Briefcase size={16} /> Especialidade principal</label>
              <input 
                type="text" 
                name="specialty"
                className="form-input" 
                value={profile.specialty} 
                onChange={handleChange} 
                placeholder="Ex: Limpeza Pesada, Organização"
              />
            </div>

            <div className="form-group">
              <label><Link size={16} /> Foto de Perfil (URL da imagem)</label>
              <input 
                type="url" 
                name="profile_picture_url"
                className="form-input" 
                value={profile.profile_picture_url} 
                onChange={handleChange} 
                placeholder="https://..."
              />
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
