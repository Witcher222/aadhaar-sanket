import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, Bot, Loader2, Minimize2, Maximize2, BarChart3, TrendingUp, MapPin, AlertTriangle } from 'lucide-react';
import { nationalStats, stressZones, forecastAlerts } from '@/data/mockData';

interface QuickResponse {
    query: string;
    response: string;
}

const contextualSuggestions: Record<string, string[]> = {
    '/': ['Show national overview stats', 'What are the key metrics?', 'Highlight critical areas'],
    '/dashboard': ['Show national overview stats', 'What are the key metrics?', 'Highlight critical areas'],
    '/migration': ['Top migration corridors?', 'Bihar outflow analysis', 'Urban vs rural migration'],
    '/trends': ['Show seasonality pattern', 'Compare 2024 vs 2025', 'What is the persistence index?'],
    '/stress-map': ['Which zones are critical?', 'Delhi NCR stress level', 'Infrastructure gaps'],
    '/forecasts': ['What alerts are active?', 'Population projections', 'Risk assessment'],
    '/policy': ['Priority recommendations', 'Budget allocation', 'Impact analysis'],
    '/data-quality': ['Data integrity score', 'Anomaly rate', 'Recent data issues'],
    '/ai-assistant': ['How can you help?', 'Analyze migration', 'Generate report'],
};

export const AIFloatingWidget = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ type: 'user' | 'bot'; text: string }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentSuggestions = contextualSuggestions[location.pathname] || contextualSuggestions['/'];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateQuickResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('stat') || lowerQuery.includes('overview') || lowerQuery.includes('metric')) {
            return `📊 **Quick Stats:**\n• Total Enrolments: ${(nationalStats.totalEnrolments / 1000000).toFixed(2)}M\n• Active Migrations: ${(nationalStats.activeMigrations / 1000).toFixed(0)}K\n• Velocity: ${nationalStats.migrationVelocity}\n\n👉 [View Dashboard](/dashboard)`;
        }

        if (lowerQuery.includes('stress') || lowerQuery.includes('zone') || lowerQuery.includes('critical')) {
            const criticalZones = stressZones.filter(z => z.severity === 'severe');
            return `🔥 **Critical Zones:**\n${criticalZones.map(z => `• ${z.name}: ${z.pressure}% pressure`).join('\n')}\n\n👉 [View Stress Map](/stress-map)`;
        }

        if (lowerQuery.includes('alert') || lowerQuery.includes('forecast') || lowerQuery.includes('predict')) {
            const topAlerts = forecastAlerts.slice(0, 2);
            return `⚠️ **Active Alerts:**\n${topAlerts.map(a => `• ${a.title} (${a.level})`).join('\n')}\n\n👉 [View Forecasts](/forecasts)`;
        }

        if (lowerQuery.includes('migration') || lowerQuery.includes('corridor') || lowerQuery.includes('flow')) {
            return `📈 **Migration Insights:**\n• Top corridor: UP → Maharashtra (312K)\n• Peak season: Oct-Dec\n• Urban migration: 62%\n\n👉 [View Patterns](/migration)`;
        }

        if (lowerQuery.includes('help') || lowerQuery.includes('how')) {
            return `🤖 **I can help you with:**\n• Migration analysis\n• Stress zone monitoring\n• Forecast predictions\n• Policy recommendations\n\n💡 For detailed analysis, try the full AI Chatbot!`;
        }

        return `🤖 I understand you're asking about "${query}".\n\nFor detailed analysis, I recommend visiting the **AI Chatbot** for comprehensive insights.\n\n👉 [Open AI Chatbot](/ai-chatbot)`;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { type: 'user', text: input }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const response = generateQuickResponse(input);
            setMessages(prev => [...prev, { type: 'bot', text: response }]);
            setIsTyping(false);
        }, 800);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        handleSend();
    };

    const handleLinkClick = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        navigate(path);
        setIsOpen(false);
    };

    // Don't show on landing page
    if (location.pathname === '/') return null;

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-elevated flex items-center justify-center hover:shadow-glow transition-all"
                    >
                        <Sparkles className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Widget */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed bottom-6 right-6 z-50 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden ${isMinimized ? 'w-80' : 'w-96'}`}
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/20">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">AI Quick Assistant</h4>
                                    <p className="text-xs text-muted-foreground">Ask anything...</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="h-72 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 && (
                                        <div className="text-center py-6">
                                            <Sparkles className="w-10 h-10 text-primary/30 mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">Ask me about your current page!</p>
                                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                                {currentSuggestions.map((sug, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleSuggestionClick(sug)}
                                                        className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-full text-foreground transition-colors"
                                                    >
                                                        {sug}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.type === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-secondary/50 text-foreground'
                                                    }`}
                                            >
                                                <p
                                                    className="whitespace-pre-wrap leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: msg.text
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
                                                                `<a href="${url}" class="text-primary underline hover:no-underline" data-link="${url}">${text}</a>`
                                                            ),
                                                    }}
                                                    onClick={(e) => {
                                                        const target = e.target as HTMLElement;
                                                        if (target.tagName === 'A' && target.dataset.link) {
                                                            e.preventDefault();
                                                            navigate(target.dataset.link);
                                                            setIsOpen(false);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="p-3 bg-secondary/50 rounded-xl">
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 border-t border-border bg-secondary/20">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Type your question..."
                                            className="flex-1 px-3 py-2 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isTyping}
                                            className="p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => navigate('/ai-chatbot')}
                                        className="w-full mt-2 text-xs text-primary hover:underline"
                                    >
                                        Open Full AI Chatbot →
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
