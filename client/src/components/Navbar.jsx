import React, { useState, useEffect } from 'react';
import { Menu, X, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const userRole = localStorage.getItem('user_role');

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  };

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <img src="/logo2.png" alt="EsponJÁ Logo" className="logo-img" />
          EsponJÁ
        </Link>

        {isHome && (
          <div className="nav-links">
            <a href="#how-it-works" className="nav-link">Como Funciona</a>
            <a href="#features" className="nav-link">Segurança</a>
            <a href="#testimonials" className="nav-link">Avaliações</a>
            <a href="#cta" className="nav-link">Lista de Espera</a>
          </div>
        )}

        <div className="nav-actions">
          {userRole ? (
            <>
              {userRole === 'admin' && <Link to="/admin" className="nav-link hide-mobile" style={{ display: 'flex', alignItems: 'center', paddingTop: '3px' }}><Home size={27} /></Link>}
              {userRole === 'customer' && <Link to="/client/home" className="nav-link hide-mobile" style={{ display: 'flex', alignItems: 'center', paddingTop: '3px' }}><Home size={27} /></Link>}
              {userRole === 'provider' && <Link to="/provider/home" className="nav-link hide-mobile" style={{ display: 'flex', alignItems: 'center', paddingTop: '3px' }}><Home size={27} /></Link>}
              <button onClick={handleLogout} className="btn btn-secondary">Sair</button>
            </>
          ) : (
            <>
              <Link to="/register?type=provider" className="nav-link hide-mobile">Seja um Profissional</Link>
              <Link to="/login" className="btn btn-primary">Entrar</Link>
            </>
          )}
          
          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
