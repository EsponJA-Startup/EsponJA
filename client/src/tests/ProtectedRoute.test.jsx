import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve redirecionar para /login se o usuário não estiver logado', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <div data-testid="protected-content">Conteúdo Secreto</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('deve renderizar os filhos (children) se a role for permitida', () => {
    localStorage.setItem('user_role', 'customer');

    render(
      <MemoryRouter initialEntries={['/client-dashboard']}>
        <Routes>
          <Route 
            path="/client-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <div data-testid="protected-content">Conteúdo do Cliente</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});

    it('deve redirecionar um cliente para /client/home se ele tentar acessar uma rota exclusiva de prestador', () => {
    localStorage.setItem('user_role', 'customer');

    render(
      <MemoryRouter initialEntries={['/area-do-prestador']}>
        <Routes>
          {/* Rota para onde ele deve ser chutado */}
          <Route path="/client/home" element={<div data-testid="client-home">Home do Cliente</div>} />
          
          {/* Rota bloqueada que ele tentou acessar */}
          <Route 
            path="/area-do-prestador" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <div data-testid="provider-content">Conteúdo do Prestador</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('provider-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('client-home')).toBeInTheDocument();
  });