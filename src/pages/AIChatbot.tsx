import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { nationalStats, migrationFlows, stressZones, forecastAlerts, policyRecommendations, aiSuggestedQueries } from '@/data/realData';
import { Send, Bot, User, Sparkles, BarChart3, Loader2, Download, Copy, RefreshCw, Trash2, PieChart, TrendingUp, MapPin, AlertTriangle, FileText, Clock, Bookmark, Star } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, AreaChart, Area, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Tooltip } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: number;
    type: 'user' | 'assistant';
    content: string;
    chartData?: { name: string; value: number }[];
    chartType?: 'line' | 'area' | 'pie' | 'bar';
    tableData?: { label: string; value: string }[];
    timestamp: Date;
    starred?: boolean;
}

interface ChatSession {
    id: number;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messages: Message[];
}

const AIChatbot = () => {
    const { toast } = useToast();

    // Initialize sessions with sample conversations from localStorage or defaults
    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        const saved = localStorage.getItem('aiChatSessions');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Convert date strings back to Date objects
            return parsed.map((s: any) => ({
                ...s,
                timestamp: new Date(s.timestamp),
                messages: s.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }))
            }));
        }

        // Default sample sessions with actual conversations
        return [
            {
                id: 1,
                title: 'Migration Analysis - Delhi',
                lastMessage: 'Analyzed Delhi NCR migration patterns with 62% urban-to-urban flow',
                timestamp: new Date(Date.now() - 3600000),
                messages: [
                    {
                        id: 1,
                        type: 'assistant',
                        content: "Hello! I'm the **Aadhaar Sanket AI Assistant** powered by advanced analytics.\n\nI can help you with:\n• 📊 Migration pattern analysis\n• 🗺️ Regional stress assessments\n• 📈 Population forecasts\n• 📋 Policy impact analysis\n• 📁 Data quality reports\n\nAsk me anything about demographic intelligence!",
                        timestamp: new Date(Date.now() - 3700000),
                    },
                    {
                        id: 2,
                        type: 'user',
                        content: 'Show me migration patterns for Delhi NCR',
                        timestamp: new Date(Date.now() - 3650000),
                    },
                    {
                        id: 3,
                        type: 'assistant',
                        content: "📊 **Migration Flow Analysis**\n\nBased on current UIDAI address change data:\n\n**Top 5 Migration Corridors:**\n1. Delhi NCR → Bangalore: **125K** migrants\n2. Mumbai → Delhi NCR: **98K** migrants\n3. Chennai → Bangalore: **87K** migrants\n4. Pune → Mumbai: **76K** migrants\n5. Hyderabad → Bangalore: **65K** migrants\n\n**Key Insights:**\n• Urban-to-urban migration dominates at 62%\n• Seasonal patterns peak during Oct-Dec\n• IT/Services sector drives 45% of interstate movement\n\n💡 *Click on any corridor above for detailed breakdown*",
                        timestamp: new Date(Date.now() - 3600000),
                        chartData: [
                            { name: 'Delhi→Bangalore', value: 125 },
                            { name: 'Mumbai→Delhi', value: 98 },
                            { name: 'Chennai→Bangalore', value: 87 },
                            { name: 'Pune→Mumbai', value: 76 },
                            { name: 'Hyderabad→Bangalore', value: 65 }
                        ],
                        chartType: 'bar',
                    }
                ],
            },
            {
                id: 2,
                title: 'Stress Zone Report',
                lastMessage: 'Generated critical stress zone analysis for 5 high-pressure regions',
                timestamp: new Date(Date.now() - 86400000),
                messages: [
                    {
                        id: 1,
                        type: 'assistant',
                        content: "Hello! I'm the **Aadhaar Sanket AI Assistant** powered by advanced analytics.\n\nI can help you with:\n• 📊 Migration pattern analysis\n• 🗺️ Regional stress assessments\n• 📈 Population forecasts\n• 📋 Policy impact analysis\n• 📁 Data quality reports\n\nAsk me anything about demographic intelligence!",
                        timestamp: new Date(Date.now() - 86500000),
                    },
                    {
                        id: 2,
                        type: 'user',
                        content: 'Analyze current population stress zones',
                        timestamp: new Date(Date.now() - 86450000),
                    },
                    {
                        id: 3,
                        type: 'assistant',
                        content: "🔥 **Stress Zone Analysis**\n\nCurrent population pressure assessment:\n\n**Critical Zones:**\n• **Delhi NCR** - SEVERE (85% pressure)\n  Population: 32M | Growth: +4.2%\n• **Mumbai Metro** - HIGH (78% pressure)\n  Population: 24M | Growth: +3.8%\n• **Bangalore Urban** - HIGH (72% pressure)\n  Population: 15M | Growth: +5.1%\n\n**Recommendations:**\n1. Prioritize infrastructure in Delhi NCR and Mumbai Metro\n2. Deploy mobile health units in rapid-growth zones\n3. Accelerate housing projects in Bangalore Urban",
                        timestamp: new Date(Date.now() - 86400000),
                        chartData: [
                            { name: 'Delhi', value: 85 },
                            { name: 'Mumbai', value: 78 },
                            { name: 'Bangalore', value: 72 },
                            { name: 'Hyderabad', value: 58 },
                            { name: 'Chennai', value: 52 }
                        ],
                        chartType: 'bar',
                    }
                ],
            },
        ];
    });

    const [activeSession, setActiveSession] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            type: 'assistant',
            content: "Hello! I'm the **Aadhaar Sanket AI Assistant** powered by advanced analytics.\n\nI can help you with:\n• 📊 Migration pattern analysis\n• 🗺️ Regional stress assessments\n• 📈 Population forecasts\n• 📋 Policy impact analysis\n• 📁 Data quality reports\n\nAsk me anything about demographic intelligence!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickQueries, setShowQuickQueries] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const CHART_COLORS = ['hsl(30, 100%, 60%)', 'hsl(160, 84%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(280, 70%, 50%)', 'hsl(340, 75%, 55%)'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();

        // Save sessions to localStorage whenever they change
        localStorage.setItem('aiChatSessions', JSON.stringify(sessions));
    }, [messages, sessions]);

    // Save current conversation to active session
    useEffect(() => {
        if (activeSession !== null && messages.length > 1) {
            setSessions(prev => prev.map(s =>
                s.id === activeSession
                    ? {
                        ...s,
                        messages,
                        lastMessage: messages[messages.length - 1].content.substring(0, 50) + '...',
                        timestamp: new Date()
                    }
                    : s
            ));
        }
    }, [messages, activeSession]);

    // Load session when clicked
    const loadSession = (sessionId: number) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session && session.messages.length > 0) {
            setMessages(session.messages);
            setActiveSession(sessionId);
            setShowQuickQueries(false);
            toast({ title: '💬 Loaded', description: `Opened "${session.title}"` });
        }
    };

    // Create new conversation
    const startNewConversation = () => {
        const newSession: ChatSession = {
            id: Date.now(),
            title: 'New Conversation',
            lastMessage: 'Just started...',
            timestamp: new Date(),
            messages: [{
                id: 1,
                type: 'assistant',
                content: "Hello! I'm the **Aadhaar Sanket AI Assistant** powered by advanced analytics.\n\nI can help you with:\n• 📊 Migration pattern analysis\n• 🗺️ Regional stress assessments\n• 📈 Population forecasts\n• 📋 Policy impact analysis\n• 📁 Data quality reports\n\nAsk me anything about demographic intelligence!",
                timestamp: new Date(),
            }],
        };

        setSessions(prev => [newSession, ...prev]);
        setMessages(newSession.messages);
        setActiveSession(newSession.id);
        setShowQuickQueries(true);
        toast({ title: '✨ New Chat', description: 'Started a new conversation' });
    };

    const generateContextualResponse = (query: string): { text: string; chartData?: any[]; chartType?: 'line' | 'area' | 'pie' | 'bar'; tableData?: any[] } => {
        const lowerQuery = query.toLowerCase();

        // Migration analysis
        if (lowerQuery.includes('migration') || lowerQuery.includes('movement')) {
            const topFlows = migrationFlows.slice(0, 5);
            return {
                text: "📊 **Migration Flow Analysis**\n\nBased on current UIDAI address change data:\n\n**Top 5 Migration Corridors:**\n" +
                    topFlows.map((f, i) => `${i + 1}. ${f.source} → ${f.target}: **${(f.value / 1000).toFixed(0)}K** migrants`).join('\n') +
                    "\n\n**Key Insights:**\n• Urban-to-urban migration dominates at 62%\n• Seasonal patterns peak during Oct-Dec\n• IT/Services sector drives 45% of interstate movement\n\n💡 *Click on any corridor above for detailed breakdown*",
                chartData: topFlows.map(f => ({ name: `${f.source}→${f.target.split(' ')[0]}`, value: f.value / 1000 })),
                chartType: 'bar',
            };
        }

        // Stress zone analysis
        if (lowerQuery.includes('stress') || lowerQuery.includes('pressure') || lowerQuery.includes('hotspot')) {
            return {
                text: "🔥 **Stress Zone Analysis**\n\nCurrent population pressure assessment:\n\n**Critical Zones:**\n" +
                    stressZones.filter(z => z.severity === 'severe' || z.severity === 'high')
                        .map(z => `• **${z.name}** - ${z.severity.toUpperCase()} (${z.pressure}% pressure)\n  Population: ${z.population} | Growth: ${z.growthRate}`)
                        .join('\n') +
                    "\n\n**Recommendations:**\n1. Prioritize infrastructure in Delhi NCR and Mumbai Metro\n2. Deploy mobile health units in rapid-growth zones\n3. Accelerate housing projects in Bangalore Urban",
                chartData: stressZones.map(z => ({ name: z.name.split(' ')[0], value: z.pressure })),
                chartType: 'bar',
            };
        }

        // Forecasts and predictions
        if (lowerQuery.includes('forecast') || lowerQuery.includes('predict') || lowerQuery.includes('future')) {
            return {
                text: "📈 **Population Forecast Analysis**\n\n**Upcoming Alerts:**\n" +
                    forecastAlerts.slice(0, 3).map(a => `• **${a.title}** (${a.level.toUpperCase()})\n  Region: ${a.region} | Probability: ${a.probability}%`).join('\n') +
                    "\n\n**Projection Summary:**\n• 2026 Urban Population: +4.2% growth expected\n• Migration velocity index: Upward trend\n• Infrastructure gap widening in 12 districts\n\n⚠️ *Critical action needed in 3 high-alert regions*",
                chartData: Array.from({ length: 12 }, (_, i) => ({
                    name: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i],
                    value: 1200 + i * 50 + Math.random() * 100,
                })),
                chartType: 'area',
            };
        }

        // Policy recommendations
        if (lowerQuery.includes('policy') || lowerQuery.includes('recommend') || lowerQuery.includes('allocat')) {
            const topPolicies = policyRecommendations.slice(0, 4);
            return {
                text: "📋 **AI-Generated Policy Recommendations**\n\n**Priority Actions:**\n" +
                    topPolicies.map((p, i) => `${i + 1}. **${p.title}**\n   Category: ${p.category} | Budget: ${p.budget}\n   Impact: ${p.impact}`).join('\n\n') +
                    "\n\n**Budget Summary:**\n• Total estimated: ₹845 Cr\n• High urgency items: 4\n• Expected beneficiaries: 3.2M citizens",
                tableData: topPolicies.map(p => ({ label: p.title, value: p.budget })),
            };
        }

        // Data quality
        if (lowerQuery.includes('quality') || lowerQuery.includes('integrity') || lowerQuery.includes('data')) {
            return {
                text: "🛡️ **Data Quality Assessment**\n\n**Current Scores:**\n• Data Integrity: **98.2%** ✅\n• Anomaly Rate: **0.3%** ✅\n• Completeness: **99.1%** ✅\n• Timeliness: **97.8%** ✅\n• Accuracy: **98.7%** ✅\n\n**Status:** All systems operational\n**Last Full Sync:** 2 minutes ago\n**Active Data Sources:** 28 state registries\n\n💡 *All metrics exceed government benchmarks*",
                chartData: [
                    { name: 'Integrity', value: 98.2 },
                    { name: 'Completeness', value: 99.1 },
                    { name: 'Timeliness', value: 97.8 },
                    { name: 'Accuracy', value: 98.7 },
                ],
                chartType: 'bar',
            };
        }

        // National overview / stats
        if (lowerQuery.includes('national') || lowerQuery.includes('overview') || lowerQuery.includes('stats') || lowerQuery.includes('summary')) {
            return {
                text: `📊 **National Dashboard Summary**\n\n**Key Metrics:**\n• Total Enrolments: **${(nationalStats.totalEnrolments / 1000000).toFixed(2)}M**\n• Active Migrations: **${(nationalStats.activeMigrations / 1000).toFixed(0)}K** this month\n• Migration Velocity: **${nationalStats.migrationVelocity}**\n• Data Freshness: **${nationalStats.dataFreshness}**\n\n**Regional Highlights:**\n• Highest activity: Maharashtra, Karnataka, Delhi NCR\n• Fastest growing: Telangana (+5.1% YoY)\n• Stable regions: Kerala, Punjab, Haryana\n\n*Data updated in real-time from UIDAI central database*`,
                chartData: [
                    { name: 'Maharashtra', value: 35 },
                    { name: 'Karnataka', value: 28 },
                    { name: 'Delhi NCR', value: 22 },
                    { name: 'Gujarat', value: 18 },
                    { name: 'Tamil Nadu', value: 15 },
                ],
                chartType: 'pie',
            };
        }

        // Default intelligent response
        return {
            text: "🤖 **Analysis Complete**\n\nI've analyzed your query against the current demographic dataset.\n\n**Summary:**\n• Current data covers 28 states and 8 UTs\n• Real-time monitoring active for 784 districts\n• AI models updated with latest migration patterns\n\n**Suggested Actions:**\n1. Explore migration patterns for specific corridors\n2. Check stress zone alerts for resource planning\n3. Review forecast models for upcoming quarters\n\n💡 *Try asking about specific states, migration corridors, or policy recommendations*",
            chartData: Array.from({ length: 6 }, (_, i) => ({
                name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
                value: 50 + Math.random() * 50,
            })),
            chartType: 'line',
        };
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
        setIsTyping(true);
        setShowQuickQueries(false);

        // Simulate AI response
        setTimeout(() => {
            const response = generateContextualResponse(query);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    type: 'assistant',
                    content: response.text,
                    chartData: response.chartData,
                    chartType: response.chartType,
                    tableData: response.tableData,
                    timestamp: new Date(),
                },
            ]);
            setIsTyping(false);
        }, 1500);
    };

    const handleSuggestion = (suggestion: string) => {
        setInput(suggestion);
        setTimeout(() => handleSend(), 100);
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content.replace(/\*\*/g, '').replace(/•/g, '-'));
        toast({ title: '📋 Copied!', description: 'Message copied to clipboard' });
    };

    const handleExportChat = () => {
        const chatContent = messages
            .map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.type.toUpperCase()}: ${m.content.replace(/\*\*/g, '').replace(/•/g, '-')}`)
            .join('\n\n');
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aadhaar-sanket-chat-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        toast({ title: '📥 Exported!', description: 'Chat exported successfully' });
    };

    const handleStarMessage = (id: number) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
        toast({ title: '⭐ Saved!', description: 'Message bookmarked' });
    };

    const handleClearChat = () => {
        // Save current session before clearing
        if (activeSession !== null) {
            setSessions(prev => prev.map(s =>
                s.id === activeSession
                    ? { ...s, messages: [messages[0]] }
                    : s
            ));
        }
        setMessages([messages[0]]);
        setShowQuickQueries(true);
        setActiveSession(null);
        toast({ title: '🗑️ Cleared!', description: 'Chat history cleared' });
    };

    const handleDeleteSession = (sessionId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering session load

        if (sessions.length <= 1) {
            toast({ title: '⚠️ Cannot Delete', description: 'You must keep at least one conversation' });
            return;
        }

        setSessions(prev => prev.filter(s => s.id !== sessionId));

        // If we deleted the active session, start a new one
        if (activeSession === sessionId) {
            startNewConversation();
        }

        toast({ title: '🗑️ Deleted', description: 'Chat session removed' });
    };

    const renderChart = (data: any[], type: 'line' | 'area' | 'pie' | 'bar') => {
        switch (type) {
            case 'pie':
                return (
                    <RechartsPie width={200} height={150}>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>
                            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                    </RechartsPie>
                );
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={data}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(40, 20%, 90%)', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="value" fill="hsl(30, 100%, 60%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(40, 20%, 90%)', borderRadius: '8px', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="value" stroke="hsl(160, 84%, 39%)" fill="url(#chatGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <ResponsiveContainer width="100%" height={100}>
                        <LineChart data={data}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: '1px solid hsl(40, 20%, 90%)', borderRadius: '8px', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="value" stroke="hsl(30, 100%, 60%)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    const quickCategories = [
        { icon: <TrendingUp className="w-4 h-4" />, label: 'Migration Analysis', query: 'Show me the top migration corridors and patterns' },
        { icon: <MapPin className="w-4 h-4" />, label: 'Stress Zones', query: 'Analyze current population stress zones and hotspots' },
        { icon: <BarChart3 className="w-4 h-4" />, label: 'National Stats', query: 'Give me a national overview and key statistics' },
        { icon: <AlertTriangle className="w-4 h-4" />, label: 'Forecasts', query: 'What are the predicted demographic changes and alerts?' },
        { icon: <FileText className="w-4 h-4" />, label: 'Policy Insights', query: 'Recommend policies based on current data analysis' },
        { icon: <PieChart className="w-4 h-4" />, label: 'Data Quality', query: 'Show me the current data quality and integrity metrics' },
    ];

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-[calc(100vh-7rem)] flex gap-6">
                {/* Chat History Sidebar */}
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="w-72 card-elevated rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Chat History
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <button onClick={startNewConversation} className="w-full p-3 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            New Conversation
                        </button>
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                className={`relative group w-full rounded-xl text-left transition-all ${activeSession === session.id
                                        ? 'bg-primary/10 ring-1 ring-primary/30'
                                        : 'hover:bg-secondary/80'
                                    }`}
                            >
                                <button
                                    onClick={() => loadSession(session.id)}
                                    className="w-full p-3 text-left"
                                >
                                    <p className="text-sm font-medium text-foreground truncate pr-8">{session.title}</p>
                                    <p className="text-xs text-muted-foreground truncate mt-1">{session.lastMessage}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-muted-foreground">
                                            {session.timestamp.toLocaleDateString()}
                                        </p>
                                        <span className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full">
                                            {session.messages.length} msgs
                                        </span>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-all"
                                    title="Delete conversation"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-border">
                        <button onClick={handleExportChat} className="w-full p-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Chat
                        </button>
                    </div>
                </motion.div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-foreground">AI Chatbot</h1>
                                <p className="text-sm text-muted-foreground">Advanced demographic intelligence assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleClearChat} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors" title="Clear chat">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={handleExportChat} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors" title="Export chat">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Container */}
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
                                        className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-secondary to-secondary/50 text-secondary-foreground'}`}>
                                            {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                        </div>
                                        <div className={`max-w-2xl ${message.type === 'user' ? 'text-right' : ''}`}>
                                            <div className={`inline-block p-4 rounded-2xl ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-foreground'}`}>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

                                                {/* Chart visualization */}
                                                {message.chartData && message.chartType && (
                                                    <div className="mt-4 p-4 bg-card rounded-xl border border-border/50">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <BarChart3 className="w-4 h-4 text-primary" />
                                                            <span className="text-xs font-medium text-muted-foreground">Data Visualization</span>
                                                        </div>
                                                        {renderChart(message.chartData, message.chartType)}
                                                    </div>
                                                )}

                                                {/* Table data */}
                                                {message.tableData && (
                                                    <div className="mt-4 p-3 bg-card rounded-xl border border-border/50">
                                                        <table className="w-full text-sm">
                                                            <tbody>
                                                                {message.tableData.map((row, i) => (
                                                                    <tr key={i} className="border-b border-border/30 last:border-0">
                                                                        <td className="py-2 text-muted-foreground">{row.label}</td>
                                                                        <td className="py-2 text-right font-medium text-foreground">{row.value}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Message actions */}
                                            <div className="flex items-center gap-2 mt-2 justify-end">
                                                <p className="text-xs text-muted-foreground">
                                                    {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {message.type === 'assistant' && (
                                                    <>
                                                        <button onClick={() => handleCopyMessage(message.content)} className="p-1 rounded hover:bg-secondary transition-colors" title="Copy">
                                                            <Copy className="w-3 h-3 text-muted-foreground" />
                                                        </button>
                                                        <button onClick={() => handleStarMessage(message.id)} className={`p-1 rounded hover:bg-secondary transition-colors ${message.starred ? 'text-warning' : ''}`} title="Bookmark">
                                                            <Star className={`w-3 h-3 ${message.starred ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-secondary-foreground" />
                                    </div>
                                    <div className="p-4 bg-secondary/50 rounded-2xl">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            <span className="text-sm text-muted-foreground">Analyzing data...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Query Categories */}
                        {showQuickQueries && (
                            <div className="px-6 pb-4">
                                <p className="text-xs font-medium text-muted-foreground mb-3">Quick Queries:</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {quickCategories.map((cat, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSuggestion(cat.query)}
                                            className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-xl text-sm text-foreground transition-colors"
                                        >
                                            <span className="text-primary">{cat.icon}</span>
                                            {cat.label}
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
                                    placeholder="Ask anything about demographic data, migration, forecasts..."
                                    className="flex-1 px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="p-3 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AIChatbot;