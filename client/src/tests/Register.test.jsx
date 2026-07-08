import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from '../pages/Register';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { post: vi.fn() }
}));

const renderWithRouter = (initialState = null) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/register', state: initialState }]}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/primeiro-acesso" element={<div data-testid="redirect-primeiro-acesso">Primeiro Acesso</div>} />
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks(); 
  });

  it('1. deve redirecionar para /primeiro-acesso se a página for acessada sem o waitlist_id', () => {
    renderWithRouter(null); 
    
    expect(screen.getByTestId('redirect-primeiro-acesso')).toBeInTheDocument();
  });

  it('2. deve renderizar o campo de especialidade APENAS se o usuário for um prestador (provider)', () => {
    renderWithRouter({ waitlist_id: '123', intended_role: 'provider' });
    
    expect(screen.getByText(/Especialidade Principal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Processo de Verificação/i })).toBeInTheDocument();
  });

  it('3. deve bloquear o envio e exibir erro se as senhas não coincidirem', async () => {
    renderWithRouter({ waitlist_id: '123', intended_role: 'customer' });
    
    fireEvent.change(screen.getByPlaceholderText('João'), { target: { value: 'Bruce' } });
    fireEvent.change(screen.getByPlaceholderText('Silva'), { target: { value: 'Wayne' } });
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), { target: { value: 'bruce@usp.br' } });
    fireEvent.change(screen.getByPlaceholderText(/\(11\) 90000-0000/i), { target: { value: '11999999999' } });

    const passwordInput = screen.getByPlaceholderText(/Crie uma senha forte/i);
    const confirmInput = screen.getByPlaceholderText(/Digite a senha novamente/i);
    fireEvent.change(passwordInput, { target: { value: 'SenhaSegura123' } });
    fireEvent.change(confirmInput, { target: { value: 'SenhaDiferente123' } });
    
    const submitBtn = screen.getByRole('button', { name: /Criar minha Conta Segura/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/As senhas não coincidem. Por favor, verifique os campos/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('4. deve realizar o cadastro com sucesso e salvar dados no localStorage', async () => {
    api.post.mockResolvedValueOnce({ 
      data: { user_id: 'uuid-1234', role: 'customer' } 
    });

    renderWithRouter({ 
      waitlist_id: '123', 
      intended_role: 'customer',
      email: 'teste@usp.br',
      phone: '11999999999'
    });
    
    
    fireEvent.change(screen.getByPlaceholderText('João'), { target: { value: 'Bruce' } });
    fireEvent.change(screen.getByPlaceholderText('Silva'), { target: { value: 'Wayne' } });
    fireEvent.change(screen.getByPlaceholderText(/Crie uma senha forte/i), { target: { value: 'Senha123' } });
    fireEvent.change(screen.getByPlaceholderText(/Digite a senha novamente/i), { target: { value: 'Senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar minha Conta Segura/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', expect.any(Object));
    });

    expect(screen.getByText(/Cadastro realizado com sucesso!/i)).toBeInTheDocument();

    expect(localStorage.getItem('user_id')).toBe('uuid-1234');
    expect(localStorage.getItem('user_role')).toBe('customer');
  });

  it('5. deve exibir mensagem de erro se a API retornar falha (ex: email já cadastrado)', async () => {
    
    api.post.mockRejectedValueOnce({
      response: { data: { detail: 'Este email já completou o registro.' } }
    });

    renderWithRouter({ waitlist_id: '123', intended_role: 'customer' });
    
    fireEvent.change(screen.getByPlaceholderText('João'), { target: { value: 'Diana' } });
    fireEvent.change(screen.getByPlaceholderText('Silva'), { target: { value: 'Prince' } });
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), { target: { value: 'diana@usp.br' } });
    fireEvent.change(screen.getByPlaceholderText(/\(11\) 90000-0000/i), { target: { value: '11999999999' } });
    fireEvent.change(screen.getByPlaceholderText(/Crie uma senha forte/i), { target: { value: 'Senha123' } });
    fireEvent.change(screen.getByPlaceholderText(/Digite a senha novamente/i), { target: { value: 'Senha123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Criar minha Conta Segura/i }));

    
    expect(await screen.findByText(/Este email já completou o registro./i)).toBeInTheDocument();
  });
});