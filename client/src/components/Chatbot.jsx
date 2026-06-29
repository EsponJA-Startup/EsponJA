import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import './Chatbot.css';

export default function Chatbot() {
  const userRole = localStorage.getItem('user_role');
  const isCustomer = userRole === 'customer';
  const initialMessage = isCustomer 
    ? 'Olá! Sou o assistente virtual da EsponJA. Como posso ajudar você hoje?'
    : 'Olá! Vimos que você não está logado no nosso site. Se já tiver uma conta de cliente, basta realizar o login. Caso contrário, registre-se e torne-se nosso cliente para poder agendar serviços por aqui!';

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: initialMessage, sender: 'bot' }
  ]);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRestart = () => {
    setMessages([{ id: Date.now(), text: initialMessage, sender: 'bot' }]);
    setHasBooked(false);
    setInputMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsgText = inputMessage;
    // Adiciona a mensagem do usuário na tela
    const newUserMsg = { id: Date.now(), text: userMsgText, sender: 'user' };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let historyToSend = messages
        .filter(msg => !msg.isError)
        .map(msg => ({
          role: msg.sender === 'bot' ? 'model' : 'user',
          content: msg.text
        }));
      
      historyToSend.push({ role: 'user', content: userMsgText });

      // A API do Gemini exige que o histórico comece com 'user' e alterne
      let validHistory = [];
      for (const msg of historyToSend) {
        if (validHistory.length === 0) {
          if (msg.role === 'user') validHistory.push(msg);
        } else {
          if (validHistory[validHistory.length - 1].role !== msg.role) {
            validHistory.push(msg);
          } else {
            validHistory[validHistory.length - 1].content += "\n" + msg.content;
          }
        }
      }

      const response = await api.post('/chat', { history: validHistory });
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: response.data.reply, sender: 'bot' }
      ]);
      if (response.data.booked) {
        setHasBooked(true);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem para a API:", error);
      const errorMsg = error.response?.data?.detail || 'Desculpe, não consegui me conectar ao servidor.';
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: errorMsg, sender: 'bot', isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={24} color="white" />
              </div>
              <div className="chatbot-header-text">
                <h3>Assistente EsponJA</h3>
                <p>Online</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat} aria-label="Fechar chat">
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {hasBooked ? (
            <div className="chatbot-restart-area" style={{ padding: '15px', borderTop: '1px solid #eee', background: 'var(--bg-light)' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleRestart}
                style={{ width: '100%' }}
              >
                Nova Reserva (Reiniciar Conversa)
              </button>
            </div>
          ) : (
            <form className="chatbot-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="chatbot-input"
                placeholder={isCustomer ? "Digite sua mensagem..." : "Faça login para conversar"}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={!isCustomer}
              />
              <button 
                type="submit" 
                className="chatbot-send-btn" 
                disabled={!inputMessage.trim() || !isCustomer}
                aria-label="Enviar"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      )}

      <button 
        className="chatbot-toggle-btn" 
        onClick={toggleChat}
        aria-label="Abrir assistente virtual"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageSquare size={28} />
      </button>
    </div>
  );
}
