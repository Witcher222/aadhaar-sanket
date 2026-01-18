import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    LayoutDashboard,
    Map,
    TrendingUp,
    AlertTriangle,
    FileCheck,
    Database,
    Bot,
    Info,
    ShieldCheck,
    ArrowRight,
    MousePointer2,
    Zap,
    Activity,
    Users,
    Search,
    MessageSquare,
    Download,
    Calculator,
    BookMarked,
    Sparkles,
    FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserGuide = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Navigation Center",
            description: "Quickly access major intelligence modules",
            icon: LayoutDashboard,
            items: [
                { name: "National Overview", path: "/dashboard", icon: LayoutDashboard, desc: "High-level summary of all national metrics." },
                { name: "Advanced Insights", path: "/advanced", icon: Sparkles, desc: "Deep-dive tools: Policy Simulator, Sankey Flows, and Hidden Migration Index." },
                { name: "Reports & Analytics", path: "/reports", icon: FileText, desc: "Generate PDF/HTML reports with AI executive summaries." },
                { name: "Spatial Stress Map", path: "/stress-map", icon: Map, desc: "Visualizing population pressure across urban zones." },
                { name: "Trend Analysis", path: "/trends", icon: TrendingUp, desc: "AI-powered pattern recognition and forecasting." },
                { name: "Forecasts & Alerts", path: "/forecasts", icon: AlertTriangle, desc: "Early warning system for demographic shifts." },
                { name: "AI Assistant", path: "/ai-assistant", icon: MessageSquare, desc: "Interactive intelligence analysis and reporting." },
            ]
        },
        {
            title: "Terminology Glossary",
            description: "Key concepts explained in simple terms",
            icon: BookMarked,
            items: [
                { name: "MVI (Migration Velocity Index)", icon: Activity, desc: "A 0-100 score measuring the speed and intensity of demographic movement in a region. Higher = more mobility." },
                { name: "Signal vs Noise", icon: Zap, desc: "We separate genuine migration signals (address changes) from routine updates (mandatory biometric renewals at age 5/15)." },
                { name: "Zone Types", icon: Map, desc: "Stable (<5 MVI), Moderate (5-15), Elevated (15-30), High Inflow (>30). These classify regions by migration pressure." },
                { name: "Anomaly Detection", icon: AlertTriangle, desc: "Statistical alerts when any metric deviates significantly from historical patterns (Z-score based)." },
                { name: "Trend Typology", icon: TrendingUp, desc: "Classification of patterns: Persistent Inflow, Emerging, Volatile, Reversal, or Stable." },
            ]
        },
        {
            title: "Calculation Methods",
            description: "How we compute key metrics",
            icon: Calculator,
            items: [
                { name: "MVI Calculation", icon: Activity, desc: "MVI = (Demographic Updates × Weight) + (Biometric Updates × Weight) – Noise Factors. Weighted by age group significance." },
                { name: "Zone Classification", icon: Map, desc: "Based on MVI thresholds: <5 = Stable, 5-15 = Moderate, 15-30 = Elevated, >30 = High Inflow." },
                { name: "Alert Scoring", icon: AlertTriangle, desc: "Z-score analysis: |Z| > 4 = Critical, |Z| > 3 = High, |Z| > 2 = Medium. Based on 30-day rolling average." },
                { name: "Signal Separation", icon: Zap, desc: "Demographic adult changes = 100% signal. Biometric at age 5/15 = 10% signal (mandatory renewals = noise)." },
            ]
        },
        {
            title: "Symbol Dictionary",
            description: "Understand the visual indicators used across the platform",
            icon: Search,
            items: [
                { name: "Justification Icon", icon: Info, desc: "Click this wherever you see it to see the underlying data, formulas, and AI reasoning." },
                { name: "Live Data Feed", icon: ShieldCheck, desc: "Indicates that the data is being fetched and processed in real-time." },
                { name: "Severe Alert", icon: AlertTriangle, desc: "Indicates a high-risk zone or metric requiring immediate attention." },
                { name: "Trend Velocity", icon: Zap, desc: "Represents how quickly a specific demographic pattern is accelerating." },
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="p-6 space-y-8 max-w-[1200px] mx-auto fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8 border border-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-bold">
                            <BookOpen className="w-4 h-4" />
                            <span>System Manual</span>
                        </div>
                        <h1 className="text-4xl font-display font-bold text-foreground">Welcome to Aadhaar Sanket</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            This guide helps you navigate our Demographic Intelligence Platform. Learn how to track migration patterns, analyze spatial stress, and verify data sources with transparency.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Sections */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                {sections.map((section, idx) => (
                    <motion.div key={idx} variants={itemVariants} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <section.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-bold text-foreground">{section.title}</h3>
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {section.items.map((item, i) => (
                                <Card key={i} className="p-4 hover:shadow-glow transition-all border border-border/50 group">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-secondary rounded-lg text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-foreground">{item.name}</h4>
                                                {item.path && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/10"
                                                        onClick={() => navigate(item.path!)}
                                                    >
                                                        Go to Page <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions / Tutorial */}
            <section className="space-y-6 bg-secondary/30 p-8 rounded-3xl border border-border">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-display font-bold text-foreground">How to use Transparency Features</h3>
                    <p className="text-muted-foreground">We believe in data accountability. Here's how to verify any metric on the site.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-elevated p-6 text-center space-y-4 bg-background">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                            <MousePointer2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold">1. Hover & Click</h4>
                        <p className="text-sm text-muted-foreground">Look for cards with metrics. Most have a hidden Info icon that appears on hover.</p>
                    </div>

                    <div className="card-elevated p-6 text-center space-y-4 bg-background">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                            <Info className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold">2. View Justification</h4>
                        <p className="text-sm text-muted-foreground">Click the icon to see data sources, formulas used, and timestamps of ingestion.</p>
                    </div>

                    <div className="card-elevated p-6 text-center space-y-4 bg-background">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                            <Bot className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold">3. Ask AI Assistant</h4>
                        <p className="text-sm text-muted-foreground">Still need clarity? Open the AI Assistant at any point to ask deep-dive questions.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UserGuide;
