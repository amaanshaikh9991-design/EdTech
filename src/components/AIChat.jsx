import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { apiUrl } from '../api.js'
import '../styles/AIChat.css'

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const studentId = localStorage.getItem('currentStudentId')
    if (!studentId) return undefined
    let active = true

    fetch(apiUrl(`students/${studentId}`))
      .then((response) => response.ok ? response.json() : null)
      .then((student) => {
        if (active && student?.chatHistory?.length) {
          setMessages(student.chatHistory.map((message) => ({
            role: message.role === 'ai' ? 'ai' : 'user',
            text: message.content,
          })))
        }
      })
      .catch(() => {})

    return () => { active = false }
  }, [])

  const handleSend = async (message = input) => {
    const content = message.trim()
    const studentId = localStorage.getItem('currentStudentId')
    if (!content || typing || !studentId) return

    setMessages((previous) => [...previous, { role: 'user', text: content }])
    setInput('')
    setTyping(true)

    try {
      const response = await fetch(apiUrl('chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, message: content }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The AI could not respond.')
      setMessages((previous) => [...previous, { role: 'ai', text: data.reply }])
    } catch (error) {
      setMessages((previous) => [...previous, { role: 'ai', text: error.message || 'Could not reach the AI service.' }])
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <Bot size={20} color="#4ade80" />
        <span className="chat-title">Your AI Tutor</span>
        <span className="chat-status">
          <span className="status-dot"></span>
          Personalized
        </span>
      </div>

      <div className="tutor-welcome">
        <strong>Hi, I'm your EduCraft AI tutor.</strong>
        <p>I can quickly summarize your saved tasks and marks, explain your progress, and suggest what to study next.</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="message-bubble">
              <p className="message-text">{msg.text}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="message message-ai">
            <div className="message-avatar">
              <Bot size={14} />
            </div>
            <div className="message-bubble typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Ask your AI tutor about your progress..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || typing} aria-label="Send message">
          <Send size={18} />
        </button>
      </div>

      <div className="chat-suggestions">
        {['Summarize my progress', 'How are my marks?', 'What should I study next?'].map((suggestion) => (
          <button key={suggestion} className="suggestion-chip" onClick={() => handleSend(suggestion)} disabled={typing}>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}