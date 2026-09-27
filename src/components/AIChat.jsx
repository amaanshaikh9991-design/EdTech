import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import '../styles/AIChat.css'

const aiResponses = {
  'who is at risk': '🚨 Currently 5 students are at critical risk:\n\n• Emma Wilson - No login for 5 days\n• Tom Garcia - Failed 3 quizzes\n• Mike Ross - Low participation\n• David Brown - Engagement dropped 40%\n• Lisa Park - Assignment scores declining\n\nWould you like me to draft intervention emails?',
  'engagement': '📊 This week\'s engagement breakdown:\n\n• Overall: 78.5% (+12% from last week)\n• Video lectures: 85% completion\n• Discussions: 62% participation\n• Assignments: 91% on-time\n\nTop performers: Priya Patel (95%), Alex Chen (92%)\n\nRecommendation: Add more interactive discussions to boost the 62% rate.',
  'retention': '🎯 Retention Analysis:\n\n• Current semester retention: 91%\n• Predicted end-of-term: 89%\n• At-risk of dropping: 22 students\n\nKey factors affecting retention:\n1. Assignment completion rate\n2. Login frequency\n3. Discussion participation\n\nSuggested actions: Early intervention for the 22 at-risk students could improve retention to 94%.',
  'help': '🤖 I can help you with:\n\n• "Who is at risk?" - Identify struggling students\n• "Engagement" - View engagement metrics\n• "Retention" - Retention analysis\n• "Generate report" - Create weekly report\n• "Suggest interventions" - Get action plans\n• "Compare classes" - Class comparison\n\nJust type your question!',
}

const defaultResponses = [
  " Based on my analysis, I'd recommend focusing on the 5 at-risk students this week. Would you like a detailed intervention plan?",
  "📈 The data shows a positive trend! Engagement is up 12% compared to last week. Keep up the great work!",
  "🎯 I've identified a pattern: students who participate in discussions score 23% higher. Consider making discussions mandatory.",
  "⚡ Quick tip: Sending personalized messages to disengaged students increases re-engagement by 40%.",
]

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "⛏️ Welcome to EduCraft AI! I'm your intelligent teaching assistant. Ask me about student engagement, at-risk learners, retention trends, or type 'help' for commands." }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getAIResponse = (query) => {
    const lower = query.toLowerCase()
    for (const [key, response] of Object.entries(aiResponses)) {
      if (lower.includes(key)) return response
    }
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const aiMsg = { role: 'ai', text: getAIResponse(input) }
      setMessages(prev => [...prev, aiMsg])
      setTyping(false)
    }, 1000 + Math.random() * 1500)
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
        <span className="chat-title">AI Assistant</span>
        <span className="chat-status">
          <span className="status-dot"></span>
          Online
        </span>
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
          placeholder="Ask about students, engagement, retention..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
          <Send size={18} />
        </button>
      </div>

      <div className="chat-suggestions">
        {['Who is at risk?', 'Engagement stats', 'Retention analysis', 'Help'].map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => { setInput(s); }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}