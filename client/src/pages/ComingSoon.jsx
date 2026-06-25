import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ComingSoon.css';

export default function ComingSoon() {
  return (
    <div className="coming-soon-page">
      <Navbar />
      <main className="coming-soon-main">
        <div className="coming-soon-card">
          <h2>Em Breve!</h2>
          <p className="coming-soon-subtitle">
            Esta funcionalidade ainda não está disponível na versão atual do nosso aplicativo.
          </p>
          <p className="coming-soon-text">
            No momento, estamos aceitando inscrições em nossa lista de espera. Cadastre-se para ser um dos primeiros a usar o EsponJÁ quando lançarmos!
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Voltar para a Página Inicial
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
