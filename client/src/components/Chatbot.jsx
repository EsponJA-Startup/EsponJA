import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import './Chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá! Sou o assistente virtual da EsponJA. Como posso ajudar você hoje?', sender: 'bot' }
  ]);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Adiciona a mensagem do usuário na tela
    const newUserMsg = { id: Date.now(), text: inputMessage, sender: 'user' };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');

    // TODO (Issue 3): Integrar com o backend real.
    // Por enquanto, simulamos uma resposta:
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: 'Entendi! Estamos configurando minha inteligência. Logo estarei apto a agendar serviços para você!', sender: 'bot' }
      ]);
    }, 1000);
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
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Digite sua mensagem..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button 
              type="submit" 
              className="chatbot-send-btn" 
              disabled={!inputMessage.trim()}
              aria-label="Enviar"
            >
              <Send size={18} />
            </button>
          </form>
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
