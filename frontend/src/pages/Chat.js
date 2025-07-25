import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PagesCommon.css';
import './Chat.css';

const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

    // Fetch context data (courses, professors) once on mount
    const [context, setContext] = useState({ courses: [], professors: [] });
    useEffect(() => {
        const fetchContext = async () => {
            try {
                const [coursesRes, professorsRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/courses'),
                    axios.get('http://localhost:5001/api/professors')
                ]);
                setContext({ courses: coursesRes.data, professors: professorsRes.data });
                setContextLoaded(true);
            } catch (err) {
                setError('Failed to load context data. You can still chat, but answers may be less accurate.');
                setContextLoaded(true);
            }
        };
        fetchContext();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e, overrideInput) => {
        if (e) e.preventDefault();
        const question = overrideInput !== undefined ? overrideInput : input;
        if (!question.trim()) return;
        setMessages([...messages, { role: 'user', content: question }]);
        setInput('');
        setLoading(true);
        setError(null);
        setHasUserInput(true);
        try {
            // Compose context for the LLM
            const contextPrompt = `Courses: ${JSON.stringify(context.courses)}\nProfessors: ${JSON.stringify(context.professors)}\nChat history: ${JSON.stringify(messages)}`;
            const openrouterMessages = [
                { role: 'system', content: 'You are Course Buddy GPT, a helpful academic assistant for SFSU Computer Science students. Use the provided context to answer questions about courses, professors, and give personalized recommendations.' },
                { role: 'system', content: contextPrompt },
                ...messages,
                { role: 'user', content: question }
            ];
            const res = await axios.post(
                OPENROUTER_API_URL,
                {
                    model: 'openai/gpt-3.5-turbo',
                    messages: openrouterMessages,
                    max_tokens: 512
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const reply = res.data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
            setMessages(msgs => [...msgs, { role: 'assistant', content: reply }]);
        } catch (err) {
            setError('Failed to get a response from OpenRouter.');
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