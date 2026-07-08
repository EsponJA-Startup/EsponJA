import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Chatbot from '../components/Chatbot'; 

vi.mock('../services/api', () => ({
  default: { post: vi.fn() }
}));

describe('Chatbot Component - Auth State Rendering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar a mensagem de bloqueio quando o usuário NÃO está logado', () => {
    render(<Chatbot />);
    
    const toggleBtn = screen.getByRole('button', { name: /abrir assistente/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Vimos que você não está logado no nosso site/i)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/Faça login para conversar/i);
    expect(input).toBeDisabled();
  });

  it('deve renderizar a saudação do assistente quando o usuário É UM CLIENTE', () => {
    localStorage.setItem('user_role', 'customer');
    
    render(<Chatbot />);
    
    const toggleBtn = screen.getByRole('button', { name: /abrir assistente/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Sou o assistente virtual da EsponJÁ/i)).toBeInTheDocument();
    
    const scheduleBtn = screen.getByRole('button', { name: /Agendar um serviço/i });
    expect(scheduleBtn).toBeInTheDocument();
  });
});