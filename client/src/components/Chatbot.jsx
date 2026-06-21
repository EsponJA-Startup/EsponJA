import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      const historyToSend = messages.map(msg => ({
        role: msg.sender === 'bot' ? 'model' : 'user',
        content: msg.text
      }));
      historyToSend.push({ role: 'user', content: userMsgText });

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: historyToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev, 
          { id: Date.now() + 1, text: data.reply, sender: 'bot' }
        ]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { id: Date.now() + 1, text: 'Desculpe, ocorreu um erro na comunicação com o servidor.', sender: 'bot' }
        ]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem para a API:", error);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, text: 'Desculpe, não consegui me conectar ao servidor.', sender: 'bot' }
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
