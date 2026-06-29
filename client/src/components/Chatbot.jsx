import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import './Chatbot.css';

export default function Chatbot() {
  const userRole = localStorage.getItem('user_role');
  const isCustomer = userRole === 'customer';

  const initialMessage = isCustomer 
    ? 'Olá! Sou o assistente virtual da EsponJÁ. Como posso ajudar você hoje?'
    : 'Olá! Vimos que você não está logado no nosso site. Se já tiver uma conta de cliente, basta realizar o login. Caso contrário, registre-se e torne-se nosso cliente para poder agendar serviços por aqui!';

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: initialMessage, sender: 'bot' }
  ]);
  const messagesEndRef = useRef(null);

  // Scripted Wizard States
  const [step, setStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    service_type: '',
    home_type: '',
    bedrooms: '',
    bathrooms: '',
    has_pets: false,
    cep: '',
    address: '',
    scheduled_date: '',
    scheduled_time: ''
  });

  // Date and Time selection temp states
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');

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
    setStep(0);
    setBookingData({
      service_type: '',
      home_type: '',
      bedrooms: '',
      bathrooms: '',
      has_pets: false,
      cep: '',
      address: '',
      scheduled_date: '',
      scheduled_time: ''
    });
    setTempDate('');
    setTempTime('');
  };

  // Guidance steps transitions
  const startBooking = () => {
    const nextMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      { id: nextMsgId, text: 'Quero agendar um serviço', sender: 'user' },
      { id: nextMsgId + 1, text: 'Excelente! Vamos dar início ao seu agendamento. Que tipo de serviço você deseja?', sender: 'bot' }
    ]);
    setStep(1);
  };

  const handleOptionSelect = (key, value, userLabel, nextStep, botQuestion) => {
    setBookingData(prev => ({ ...prev, [key]: value }));
    const nextMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      { id: nextMsgId, text: userLabel, sender: 'user' },
      { id: nextMsgId + 1, text: botQuestion, sender: 'bot' }
    ]);
    setStep(nextStep);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const value = inputMessage.trim();

    if (step === 6) {
      // Validate CEP (either XXXXX-XXX or XXXXXXXX)
      const cepRegex = /^\d{5}-?\d{3}$/;
      if (!cepRegex.test(value)) {
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: `CEP informado: "${value}" está em um formato inválido. Por favor, informe um CEP válido (ex: 01310-100).`, sender: 'bot', isError: true }
        ]);
        setInputMessage('');
        return;
      }
      setBookingData(prev => ({ ...prev, cep: value }));
      const nextMsgId = Date.now();
      setMessages(prev => [
        ...prev,
        { id: nextMsgId, text: value, sender: 'user' },
        { id: nextMsgId + 1, text: 'Agora, informe o endereço completo (Rua, número, complemento, bairro e cidade):', sender: 'bot' }
      ]);
      setInputMessage('');
      setStep(7);
    } else if (step === 7) {
      setBookingData(prev => ({ ...prev, address: value }));
      const nextMsgId = Date.now();
      setMessages(prev => [
        ...prev,
        { id: nextMsgId, text: value, sender: 'user' },
        { id: nextMsgId + 1, text: 'Por favor, selecione a data em que deseja realizar o serviço:', sender: 'bot' }
      ]);
      setInputMessage('');
      setStep(8);
    }
  };

  const handleDateConfirm = () => {
    if (!tempDate) return;
    // Format date for user visual display
    const formattedDate = tempDate.split('-').reverse().join('/');
    setBookingData(prev => ({ ...prev, scheduled_date: tempDate }));
    const nextMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      { id: nextMsgId, text: formattedDate, sender: 'user' },
      { id: nextMsgId + 1, text: 'Por favor, selecione o horário desejado para o início da limpeza:', sender: 'bot' }
    ]);
    setStep(9);
  };

  const handleTimeConfirm = async () => {
    if (!tempTime) return;
    setBookingData(prev => ({ ...prev, scheduled_time: tempTime }));
    const nextMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      { id: nextMsgId, text: tempTime, sender: 'user' },
      { id: nextMsgId + 1, text: 'Processando as informações para criar o agendamento...', sender: 'bot' }
    ]);
    setStep(10);
    setIsLoading(true);

    try {
      // Build the simulated conversation history to send to Gemini
      const simulatedHistory = [
        { role: 'user', content: 'Olá, gostaria de agendar uma limpeza.' },
        { role: 'model', content: 'Olá! Com certeza. Qual tipo de serviço você precisa?' },
        { role: 'user', content: `Desejo uma ${bookingData.service_type}` },
        { role: 'model', content: 'Entendido. Qual o tipo de imóvel?' },
        { role: 'user', content: bookingData.home_type },
        { role: 'model', content: 'Quantos quartos o imóvel possui?' },
        { role: 'user', content: `${bookingData.bedrooms} quarto(s)` },
        { role: 'model', content: 'E quantos banheiros?' },
        { role: 'user', content: `${bookingData.bathrooms} banheiro(s)` },
        { role: 'model', content: 'O imóvel possui animais de estimação?' },
        { role: 'user', content: bookingData.has_pets ? 'Sim' : 'Não' },
        { role: 'model', content: 'Perfeito. Por favor, digite o CEP do local do serviço:' },
        { role: 'user', content: bookingData.cep },
        { role: 'model', content: 'Agora, informe o endereço completo (rua, número, complemento, bairro e cidade):' },
        { role: 'user', content: bookingData.address },
        { role: 'model', content: 'Em qual data você gostaria do serviço?' },
        { role: 'user', content: tempDate },
        { role: 'model', content: 'E qual o horário desejado para o início da limpeza?' },
        { role: 'user', content: tempTime }
      ];

      const response = await api.post('/chat', { history: simulatedHistory });
      
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: response.data.reply, sender: 'bot' }
      ]);
      if (response.data.booked) {
        setHasBooked(true);
      }
    } catch (error) {
      console.error("Erro ao criar agendamento via chatbot:", error);
      const errorMsg = error.response?.data?.detail || 'Desculpe, ocorreu um erro ao confirmar o agendamento no servidor.';
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: errorMsg, sender: 'bot', isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get tomorrow's date to set min date in date picker
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const renderInputArea = () => {
    if (hasBooked) {
      return (
        <div className="chatbot-restart-area" style={{ padding: '15px', borderTop: '1px solid #eee', background: 'white' }}>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleRestart}
            style={{ width: '100%' }}
          >
            Nova Reserva (Reiniciar Conversa)
          </button>
        </div>
      );
    }

    if (!isCustomer) {
      return (
        <form className="chatbot-input-area" onSubmit={e => e.preventDefault()}>
          <input
            type="text"
            className="chatbot-input"
            placeholder="Faça login para conversar"
            disabled={true}
          />
          <button type="button" className="chatbot-send-btn" disabled={true}>
            <Send size={18} />
          </button>
        </form>
      );
    }

    switch (step) {
      case 0:
        return (
          <div className="chatbot-interactive-area">
            <button className="chatbot-confirm-btn" style={{ width: '100%' }} onClick={startBooking}>
              Agendar um serviço
            </button>
          </div>
        );
      case 1:
        return (
          <div className="chatbot-interactive-area">
            {['Faxina Padrão', 'Faxina Pesada', 'Limpeza Pós-Obra', 'Limpeza Rápida'].map(service => (
              <button 
                key={service} 
                className="chatbot-opt-btn"
                onClick={() => handleOptionSelect('service_type', service, `Desejo ${service}`, 2, 'E qual o tipo do seu imóvel?')}
              >
                {service}
              </button>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="chatbot-interactive-area">
            {['Casa', 'Apartamento', 'Outro'].map(home => (
              <button 
                key={home} 
                className="chatbot-opt-btn"
                onClick={() => handleOptionSelect('home_type', home.toLowerCase(), home, 3, 'Quantos quartos possui o imóvel?')}
              >
                {home}
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="chatbot-interactive-area">
            {['1 quarto', '2 quartos', '3 quartos', '4+ quartos'].map((rooms, i) => (
              <button 
                key={rooms} 
                className="chatbot-opt-btn"
                onClick={() => handleOptionSelect('bedrooms', String(i + 1), rooms, 4, 'E quantos banheiros?')}
              >
                {rooms}
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="chatbot-interactive-area">
            {['1 banheiro', '2 banheiros', '3 banheiros', '4+ banheiros'].map((baths, i) => (
              <button 
                key={baths} 
                className="chatbot-opt-btn"
                onClick={() => handleOptionSelect('bathrooms', String(i + 1), baths, 5, 'O imóvel possui animais de estimação?')}
              >
                {baths}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="chatbot-interactive-area">
            <button 
              className="chatbot-opt-btn"
              onClick={() => handleOptionSelect('has_pets', true, 'Sim, possui pets', 6, 'Perfeito. Por favor, digite o CEP do local do serviço:')}
            >
              Sim
            </button>
            <button 
              className="chatbot-opt-btn"
              onClick={() => handleOptionSelect('has_pets', false, 'Não possui pets', 6, 'Perfeito. Por favor, digite o CEP do local do serviço:')}
            >
              Não
            </button>
          </div>
        );
      case 6:
        return (
          <form className="chatbot-input-area" onSubmit={handleTextSubmit}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Digite o CEP (ex: 01310-100)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              maxLength={9}
            />
            <button type="submit" className="chatbot-send-btn" disabled={!inputMessage.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
        );
      case 7:
        return (
          <form className="chatbot-input-area" onSubmit={handleTextSubmit}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Rua, número, bairro, cidade..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="chatbot-send-btn" disabled={!inputMessage.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
        );
      case 8:
        return (
          <div className="chatbot-datepicker-area">
            <input 
              type="date" 
              className="chatbot-date-input"
              min={getTomorrowString()}
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              disabled={isLoading}
            />
            <button 
              className="chatbot-confirm-btn" 
              onClick={handleDateConfirm}
              disabled={!tempDate || isLoading}
            >
              Confirmar
            </button>
          </div>
        );
      case 9:
        return (
          <div className="chatbot-datepicker-area">
            <select 
              className="chatbot-time-select"
              value={tempTime}
              onChange={(e) => setTempTime(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Selecione...</option>
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button 
              className="chatbot-confirm-btn" 
              onClick={handleTimeConfirm}
              disabled={!tempTime || isLoading}
            >
              Confirmar
            </button>
          </div>
        );
      case 10:
      default:
        return (
          <div className="chatbot-interactive-area">
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Processando agendamento...</p>
          </div>
        );
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
                <h3>Assistente EsponJÁ</h3>
                <p>Online</p>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={toggleChat} aria-label="Fechar chat">
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender} ${msg.isError ? 'error-message' : ''}`}>
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

          {renderInputArea()}
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
