import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const AiChat = ({ tokenId = null, serviceId = null, initialQuery = null, onClearInitialQuery = null, embedded = false }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your QueueLess assistant. How can I help you today? You can ask about current wait times, available services, queue status, or managing tokens.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providerInfo, setProviderInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    api.get('/ai/status')
      .then(res => {
        if (isMounted && res.data) {
          setProviderInfo(res.data);
        }
      })
      .catch(() => {
        // Silently catch - will default to built-in status
      });
    return () => { isMounted = false; };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (textToSend) => {
    const trimmed = textToSend?.trim();
    if (!trimmed) return;

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', { 
        message: trimmed, 
        tokenId: tokenId ? Number(tokenId) : null,
        serviceId: serviceId ? Number(serviceId) : null
      });
      const replyText = res.data?.response || res.data?.reply || 'I am sorry, I could not understand that.';
      const provider = res.data?.provider || providerInfo?.provider;
      const aiMessage = { id: Date.now() + 1, sender: 'ai', text: replyText, provider };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error', error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error || 'Sorry, I am having trouble connecting to the AI assistant right now. Please verify the backend is running at http://localhost:8080.';
      const errorMessage = { id: Date.now() + 1, sender: 'ai', text: serverMsg, isError: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (isLoading) return;
    await sendMessage(input);
  };

  useEffect(() => {
    if (initialQuery) {
      sendMessage(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);

  const containerClass = embedded 
    ? "flex flex-col h-[400px] bg-white border border-gray-200 rounded-xl overflow-hidden"
    : "flex flex-col h-[600px] bg-white shadow-xl rounded-xl overflow-hidden max-w-3xl mx-auto";

  return (
    <div className={containerClass}>
      <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <div>
            <h2 className="font-semibold text-lg leading-tight">AI Assistant</h2>
            <p className="text-xs text-primary-100">Live Queue & Smart Guidance</p>
          </div>
        </div>
        {providerInfo?.provider && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary-700/80 border border-primary-500/40 text-primary-100 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {providerInfo.provider}
          </span>
        )}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary-100' : 'bg-secondary-100'}`}>
                {msg.sender === 'user' ? <User className="h-5 w-5 text-primary-600" /> : <Bot className="h-5 w-5 text-secondary-600" />}
              </div>
              <div className={`p-3 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none shadow-sm' 
                  : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none shadow-sm'
                    : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-secondary-100">
                <Bot className="h-5 w-5 text-secondary-600" />
              </div>
              <div className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-500 rounded-tl-none flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about queues, services, wait times..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="Send Message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChat;
