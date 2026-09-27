import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentChat.css';

// For now, we hardcode studentId 1 (Alex Johnson from our seed data)
// In a real app, this would come from your AuthContext
const STUDENT_ID = 1; 

export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Fetch chat history on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/students/${STUDENT_ID}`);
        const data = await res.json();
        if (data && data.chatHistory) {
          setMessages(data.chatHistory);
        } else {
          // Welcome message if no history
          setMessages([{
            id: 'welcome',
            role: 'ai',
            content: "Hey there! ⛏️ I'm your EduCraft AI tutor. How can I help you level up your learning today?"
          }]);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'student', content: input, createdAt: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: STUDENT_ID, message: userMessage.content })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply, createdAt: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "⚠️ My mining drill got stuck! Try again.", createdAt: new Date() }]);
      }
    } catch (error) {
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