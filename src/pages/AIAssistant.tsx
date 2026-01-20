import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiSuggestedQueries } from '@/data/mockData';
import { Send, Bot, User, Sparkles, BarChart3, Loader2, MessageSquare, ClipboardList } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AIIntelligenceReport } from '@/components/AIIntelligenceReport';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm the Aadhaar Sanket AI Assistant. I can help you analyze demographic data, understand migration patterns, and generate insights. What would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), type: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context: {} }),
      });
      const data = await response.json();
      const responseText = data.answer || data.response || "I couldn't generate a response.";

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'assistant',
        content: responseText,
        timestamp: new Date()
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'assistant',
        content: "I'm having trouble connecting to the server. Please check your connection.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col p-2 overflow-y-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Intelligence Unit</h1>
          <p className="text-xs text-muted-foreground">Strategic analysis & decision support</p>
        </div>
      </div>

      <div className="space-y-8 pb-10">

        {/* SECTION 1: Intelligence Brief */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/5 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold">1. Intelligence Brief</h2>
          </div>

          <div className="w-full h-[600px] bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar p-1">
              <AIIntelligenceReport />
            </div>
          </div>
        </div>

        {/* SECTION 2: AI Interactive Chat */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/5 rounded-lg">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold">2. AI Interactive Chat</h2>
          </div>

          <div className="w-full h-[600px] bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-white border border-slate-200 shadow-sm'}`}>
                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-white border border-slate-100'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center"><Bot className="w-4 h-4 text-primary" /></div>
                  <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs flex items-center gap-2 text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> AI is thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-white">
              <div className="flex gap-3 max-w-4xl mx-auto w-full">
                <input
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="Ask a follow-up question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;