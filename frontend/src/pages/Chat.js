import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PagesCommon.css';
import './Chat.css';

const SAMPLE_QUESTIONS = [
    'What are the prerequisites for CSC 340?',
    "Tell me about Professor Timothy Sun's teaching style and his reviews.",
    'Recommend me 2 easy upper-division electives I can take next semester.',
    'Which professors have the highest ratings for CSC 415?'
];

function formatLLMResponse(text) {
    // Basic formatting: handle markdown-like bold, numbered lists, and newlines
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
        .replace(/\n\s*\d+\./g, match => `<br/>${match.trim()}`) // numbered list
        .replace(/\n\s*\-/g, match => `<br/>${match.trim()}`) // bullet list
        .replace(/\n/g, '<br/>'); // newlines
    return formatted;
}

export default function Chat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am Course Buddy GPT. Ask me anything about courses, professors, or get personalized recommendations.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextLoaded, setContextLoaded] = useState(false);
    const chatEndRef = useRef(null);
    const [hasUserInput, setHasUserInput] = useState(false);

    // Context is now handled by backend (RAG + structured data)
    useEffect(() => {
        // Just mark as loaded since backend handles all context
        setContextLoaded(true);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e, overrideInput) => {
        if (e) e.preventDefault();
        const question = overrideInput !== undefined ? overrideInput : input;
        if (!question.trim()) return;
        
        const newMessages = [...messages, { role: 'user', content: question }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setError(null);
        setHasUserInput(true);
        
        try {
            // Use RAG-enhanced backend endpoint (hybrid approach)
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5001/api/chat/query',
                {
                    question: question,
                    conversationHistory: messages
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const reply = res.data.answer || 'Sorry, I could not generate a response.';
            setMessages(msgs => [...msgs, { role: 'assistant', content: reply }]);
            
            // Optional: Log sources used for debugging
            if (res.data.sources) {
                console.log('Response sources:', res.data.sources);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setError('Failed to get a response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-fullpage-bg">
            <div className="chat-fullpage-container">
                <Link to="/dashboard" className="back-to-dashboard">
                    ← Back to Dashboard
                </Link>
                <h1>Course Buddy GPT</h1>
                <div className="chat-container">
                    {!contextLoaded ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading context data...</p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-history">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`chat-message ${msg.role}`}> 
                                        <div className="chat-bubble" dangerouslySetInnerHTML={msg.role === 'assistant' ? { __html: formatLLMResponse(msg.content) } : { __html: msg.content.replace(/\n/g, '<br/>') }} />
                                    </div>
                                ))}
                                {loading && <div className="chat-message assistant"><div className="chat-bubble loading">Thinking...</div></div>}
                                <div ref={chatEndRef} />
                            </div>
                            {!hasUserInput && (
                                <div className="sample-questions">
                                    {SAMPLE_QUESTIONS.map((q, i) => (
                                        <button key={i} className="sample-question-btn" onClick={() => handleSend(null, q)} disabled={loading}>{q}</button>
                                    ))}
                                </div>
                            )}
                            <form className="chat-input-form" onSubmit={handleSend}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask me about courses, professors, or recommendations..."
                                    disabled={loading}
                                    className="chat-input"
                                />
                                <button type="submit" disabled={loading || !input.trim()} className="send-button">Send</button>
                            </form>
                            {error && <div className="error-message">{error}</div>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 