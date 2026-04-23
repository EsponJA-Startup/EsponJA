import React from 'react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', padding: '3rem 0', borderTop: '1px solid var(--border-color)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem' }}>
          <img src="/logo2.png" alt="EsponJÁ Logo" style={{ height: '40px', width: 'auto', borderRadius: '4px' }} />
          EsponJÁ
        </div>
        <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} EsponJÁ MVP. Todos os direitos reservados. Transformando serviços domésticos no Brasil.
        </p>
      </div>
    </footer>
  );
}
