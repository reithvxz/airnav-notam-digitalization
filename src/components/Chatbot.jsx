import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, ChevronLeft } from 'lucide-react';
import { chatbotCategories, chatbotTemplates, getBotResponse } from '../data/chatbotKnowledge';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo! Saya SIMO Bot 🤖. Ada yang bisa saya bantu hari ini?',
      options: chatbotCategories
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (text = inputValue, isHiddenOption = false) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Add loading state
    const loadingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadingId, sender: 'bot', text: '...' }]);

    let botResponseText = '';
    let options = null;

    if (isHiddenOption) {
      // If it was a template question, find the answer in knowledge base
      const templates = chatbotTemplates[activeCategory] || [];
      const found = templates.find(t => t.q === text);
      botResponseText = found ? found.a : getBotResponse(text);
      
      // After answering a template, offer to go back to main menu
      options = [{ id: 'main_menu', label: '🔙 Kembali ke Menu Utama' }];
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === loadingId ? { id: loadingId, sender: 'bot', text: botResponseText, options } : msg
        ));
      }, 600);
    } else {
      // Free-text: Send to Gemini API
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: text,
            userName: user ? user.nama || user.initial : 'Karyawan'
          })
        });
        const data = await response.json();
        botResponseText = data.response;
      } catch (error) {
        botResponseText = "Koneksi terputus. Sistem AI saat ini tidak dapat diakses.";
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? { id: loadingId, sender: 'bot', text: botResponseText, options } : msg
      ));
    }
  };

  const handleOptionClick = (option) => {
    if (option.id === 'main_menu') {
      setActiveCategory(null);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'bot', text: 'Silakan pilih kategori bantuan:', options: chatbotCategories }
      ]);
      return;
    }

    // It's a main category click
    const categoryId = option.id;
    setActiveCategory(categoryId);
    
    // Show user choice in chat
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: option.label }]);
    
    // Bot replies with templates
    setTimeout(() => {
      const templates = chatbotTemplates[categoryId] || [];
      const templateOptions = templates.map(t => ({ id: t.q, label: t.q, isTemplate: true }));
      
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: `Berikut beberapa pertanyaan seputar ${option.label}. Pilih salah satu atau ketik pertanyaan Anda sendiri:`,
          options: [...templateOptions, { id: 'main_menu', label: '🔙 Kembali' }]
        }
      ]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      
      {/* Pop-up Window */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '4.5rem',
          right: 0,
          width: '350px',
          height: '500px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', 
            padding: '1rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '50%' }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'white' }}>SIMO Bot</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, color: 'white' }}>Selalu Aktif</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', gap: '8px', maxWidth: '85%', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0, marginTop: 'auto' }}>
                    {msg.sender === 'bot' ? (
                      <div style={{ background: '#e2e8f0', color: '#1e3a8a', padding: '4px', borderRadius: '50%' }}><Bot size={14} /></div>
                    ) : (
                      <div style={{ background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '50%' }}><User size={14} /></div>
                    )}
                  </div>
                  
                  {/* Bubble */}
                  <div style={{ 
                    background: msg.sender === 'user' ? '#3b82f6' : 'white', 
                    color: msg.sender === 'user' ? 'white' : '#1e293b',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                    border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text === '...' ? (
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>

                {/* Options (if any) */}
                {msg.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', width: '85%', marginLeft: '26px' }}>
                    {msg.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (opt.isTemplate) handleSend(opt.label, true);
                          else handleOptionClick(opt);
                        }}
                        style={{
                          background: 'white',
                          border: '1px solid #cbd5e1',
                          color: '#3b82f6',
                          padding: '0.6rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={e => e.currentTarget.style.background = 'white'}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              placeholder="Ketik pesan..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                outline: 'none',
                fontSize: '0.9rem',
                background: '#f8fafc'
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{
                background: inputValue.trim() ? '#3b82f6' : '#cbd5e1',
                color: 'white',
                border: 'none',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #1e3a8a)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* Simple Keyframe for Slide Up */}
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            height: 14px;
          }
          .typing-indicator span {
            width: 6px;
            height: 6px;
            background: #94a3b8;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out both;
          }
          .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
          .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
          @keyframes typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
