import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import './ClientDashboard.css';

export default function ClientDashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const services = [
    {
      id: 1,
      title: "Limpeza Padrão",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      description: "Ideal para a manutenção semanal da sua casa."
    },
    {
      id: 2,
      title: "Limpeza Pesada",
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      description: "Limpeza profunda e detalhada de todos os cômodos."
    },
    {
      id: 3,
      title: "Limpeza Pós-Obra",
      image: "https://images.unsplash.com/photo-1628177142898-93e46e623666?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      description: "Remoção de entulhos e poeira após reformas."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === services.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? services.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="client-dashboard">
      <div className="dashboard-hero">
        <div className="container dashboard-hero-container">
          <div className="dashboard-hero-content">
            <h1>Bem-vindo ao seu <span className="highlight">Painel de Cliente</span></h1>
            <p>Descubra os melhores profissionais de limpeza para a sua necessidade. Junte-se a nós para ter acesso completo a agendamentos, avaliações e muito mais.</p>
            <div className="dashboard-actions">
              <Link to="/login" className="btn btn-secondary">Entrar na minha conta</Link>
              <Link to="/register?type=customer" className="btn btn-primary">Cadastrar-se agora</Link>
            </div>
          </div>
          
          <div className="dashboard-carousel">
            <div className="carousel-container" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {services.map((service) => (
                <div className="carousel-slide" key={service.id}>
                  <img src={service.image} alt={service.title} />
                  <div className="carousel-caption">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button onClick={prevSlide} className="carousel-btn">&lt;</button>
              <div className="carousel-indicators">
                {services.map((_, idx) => (
                  <span 
                    key={idx} 
                    className={`indicator ${idx === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(idx)}
                  ></span>
                ))}
              </div>
              <button onClick={nextSlide} className="carousel-btn">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
