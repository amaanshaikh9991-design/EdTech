import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, readApiJson } from '../api.js';
import { getCurrentStudentId } from '../session.js';
import '../styles/StudentChat.css';

export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const studentId = getCurrentStudentId();

  useEffect(() => {
    if (!studentId) return undefined;

    let active = true;
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`students/${studentId}`);
        const data = await readApiJson(res, 'Could not load your chat history.');
        if (!active) return;
        if (Array.isArray(data.chatHistory) && data.chatHistory.length) {
          setMessages(data.chatHistory);
        } else {
          setMessages([{
            id: 'welcome',
            role: 'ai',
            content: "Hey there! ⛏️ I'm your EduCraft AI tutor. How can I help you level up your learning today?"
          }]);
        }
      } catch {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
    return () => { active = false; };
  }, [navigate, studentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!studentId) {
    return <div className="chat-page"><p role="alert">Your session is missing or expired. Please sign in again.</p></div>;
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !studentId) return;

    const userMessage = { role: 'student', content: input, createdAt: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiFetch('chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, message: userMessage.content })
      });
      
      const data = await readApiJson(res, 'The AI could not respond.');
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply, createdAt: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "⚠️ My mining drill got stuck! Try again.", createdAt: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ Connection lost to the server.", createdAt: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="chat-title">
          <Bot size={24} color="#4ade80" />
          <h2>EduCraft AI Tutor</h2>
        </div>
        <div className="chat-status">
          <span className="status-dot"></span> Online
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.role === 'student' ? 'student-msg' : 'ai-msg'}`}>
            <div className="message-avatar">
              {msg.role === 'student' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className="message-content">
              <p>{msg.content}</p>
              <span className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble ai-msg">
            <div className="message-avatar"><Bot size={20} /></div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask your AI tutor a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}