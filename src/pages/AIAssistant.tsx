import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiSuggestedQueries } from '@/data/mockData';
import { Send, Bot, User, Sparkles, BarChart3, Loader2, MessageSquare, ClipboardList } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { AIIntelligenceReport } from '@/components/AIIntelligenceReport';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  chartData?: { month: string; value: number }[];
  timestamp: Date;
}

const AIAssistant = () => {
  const [view, setView] = useState<'chat' | 'report'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content:
        "Hello! I'm the Aadhaar Sanket AI Assistant. I can help you analyze demographic data, understand migration patterns, and generate insights. What would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = (query: string) => {
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const responses: Record<string, { text: string; hasChart: boolean }> = {
        mumbai: {
          text: "Based on my analysis of Mumbai's migration data for 2024:\n\n📊 **Key Findings:**\n- Total inflow: 892,000 migrants\n- Primary source states: UP (34%), Bihar (28%), MP (15%)\n- Peak migration months: Oct-Dec (festival season)\n- Sector distribution: Manufacturing (40%), Services (35%), Construction (25%)\n\nThe attached chart shows monthly migration trends.",
          hasChart: true,
        },
        delhi: {
          text: "Delhi NCR population projection analysis:\n\n📈 **2026 Forecast:**\n- Projected population: 34.2 million\n- Annual growth rate: 3.8%\n- Key pressure zones: Gurgaon, Noida, Ghaziabad\n\n⚠️ **Infrastructure Gap Alert:**\n- Water supply: 15% deficit expected\n- Public transport: 22% capacity shortfall\n- Healthcare: 8 new hospitals recommended",
          hasChart: true,
        },
        compare: {
          text: "Bihar to Maharashtra vs Gujarat comparison:\n\n**To Maharashtra:**\n- Volume: 312,000/year\n- Avg stay: 8.2 years\n- Primary sector: Manufacturing\n\n**To Gujarat:**\n- Volume: 178,000/year  \n- Avg stay: 5.4 years\n- Primary sector: Construction\n\n🔍 Maharashtra attracts 75% more migrants but Gujarat shows higher retention for skilled workers.",
          hasChart: false,
        },
        school: {
          text: "School allocation analysis complete:\n\n🏫 **Priority Districts (Immediate):**\n1. Anantapur, AP - 5 schools needed\n2. Dhanbad, JH - 4 schools needed\n3. Varanasi, UP - 3 schools needed\n\n📋 **Criteria used:**\n- Child population growth >5%\n- Current student-teacher ratio >40:1\n- Distance to nearest school >3km\n\nTotal budget estimate: ₹210 Cr",
          hasChart: false,
        },
        default: {
          text: "I've analyzed your query. Here's what I found:\n\n📊 The demographic patterns show interesting trends in population movement. Key factors include seasonal employment, urbanization, and infrastructure development.\n\nWould you like me to dive deeper into any specific aspect?",
          hasChart: true,
        },
      };

      let responseKey = 'default';
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('mumbai')) responseKey = 'mumbai';
      else if (lowerQuery.includes('delhi') || lowerQuery.includes('project'))
        responseKey = 'delhi';
      else if (lowerQuery.includes('compare') || lowerQuery.includes('bihar'))
        responseKey = 'compare';
      else if (lowerQuery.includes('school') || lowerQuery.includes('district'))
        responseKey = 'school';

      const response = responses[responseKey];

      const chartData = response.hasChart
        ? Array.from({ length: 12 }, (_, i) => ({
          month: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i],
          value: Math.floor(50 + Math.random() * 50 + Math.sin(i * 0.5) * 20),
        }))
        : undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'assistant',
          content: response.text,
          chartData,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = input;
    setInput('');
    simulateResponse(query);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[calc(100vh-7rem)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">AI Intelligence Unit</h1>
            <p className="text-sm text-muted-foreground">
              Strategic analysis & decision support
            </p>
          </div>

          <div className="flex-1" />

          {/* View Toggle */}
          <div className="flex p-1 bg-secondary/50 rounded-2xl border border-border">
            <button
              onClick={() => setView('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'chat'
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              Interactive Chat
            </button>
            <button
              onClick={() => setView('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'report'
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <ClipboardList className="w-4 h-4" />
              Intelligence Brief
            </button>
          </div>
        </div>

        {view === 'report' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 overflow-y-auto custom-scrollbar pr-2"
          >
            <AIIntelligenceReport />
          </motion.div>
        ) : (
          /* Chat Container */
          <div className="flex-1 card-elevated rounded-2xl flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                        }`}
                    >
                      {message.type === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>
                    <div
                      className={`max-w-2xl ${message.type === 'user' ? 'text-right' : ''
                        }`}
                    >
                      <div
                        className={`inline-block p-4 rounded-2xl ${message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/50 text-foreground'
                          }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                        {message.chartData && (
                          <div className="mt-4 p-4 bg-card rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="w-4 h-4 text-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Monthly Trend
                              </span>
                            </div>
                            <div className="h-24">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={message.chartData}>
                                  <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis hide />
                                  <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(30, 100%, 60%)"
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Queries */}
            {messages.length <= 2 && (
              <div className="px-6 pb-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Suggested queries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestedQueries.slice(0, 4).map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(query)}
                      className="px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-xl text-sm text-foreground transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card/50">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything about demographic data..."
                  className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-3 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default AIAssistant;