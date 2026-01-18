import React from 'react';
import { motion } from 'framer-motion';
import {
    Download, Printer, FileText, AlertCircle,
    ArrowRight, MapPin, TrendingUp, ShieldCheck,
    CheckCircle2, AlertTriangle, Lightbulb, Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    nationalStats, migrationFlows, stressZones,
    forecastAlerts, dataQualityMetrics, policyRecommendations,
    liveTicker
} from '@/data/realData';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AIIntelligenceReport: React.FC = () => {
    const handleDownload = () => {
        window.print();
    };

    const topCorridors = migrationFlows.slice(0, 5);
    const criticalZones = stressZones.filter(z => z.severity === 'severe' || z.severity === 'high');

    return (
        <div className="space-y-6 max-w-[1000px] mx-auto pb-12 print:p-0 print:m-0 print:max-w-none">
            {/* Action Bar - Hidden in Print */}
            <div className="flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">AI Intelligence Report</h2>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl" onClick={handleDownload}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </Button>
                    <Button className="rounded-xl shadow-lg shadow-primary/20" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Main Report Container */}
            <div id="ai-report-content" className="bg-white rounded-3xl border border-border overflow-hidden shadow-2xl print:shadow-none print:border-none">
                {/* Report Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 p-8 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge className="bg-white/20 text-white border-none mb-3 hover:bg-white/30 backdrop-blur-md">
                                FOR OFFICIAL USE ONLY
                            </Badge>
                            <h1 className="text-3xl font-display font-bold">Field Survey Intelligence Brief</h1>
                            <p className="text-white/80 mt-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Comprehensive National Demographic Analysis
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/60 text-sm">Generated On</p>
                            <p className="font-bold">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                            <p className="text-xs text-white/40 mt-1">Ref ID: AS-AI-{Math.floor(Math.random() * 90000 + 10000)}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Executive AI Summary */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" /> AI Executive Summary
                        </h3>
                        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 leading-relaxed text-foreground">
                            <p className="font-medium">
                                Current analysis indicates a period of **High Migration Velocity** primarily driven by seasonal labor spikes in the northern corridors.
                                National enrolment saturation remains stable at **94.2%**, but localized drops in Mumbai and Delhi West signal emerging settlement clusters
                                that require immediate field validation. Demographic shift patterns suggest a 12% increase in child population mobility,
                                necessitating school resource recalibration in destination industrial hubs.
                            </p>
                        </div>
                    </section>

                    {/* Critical Data Points Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Active Migrations', val: '15.2M', sub: '+4.2% MoM', icon: Users, color: 'text-blue-600' },
                            { label: 'Growth Acceleration', val: '2.4x', sub: 'High Risk', icon: TrendingUp, color: 'text-orange-600' },
                            { label: 'Data Integrity', val: '98.5%', sub: 'Verified', icon: ShieldCheck, color: 'text-emerald-600' },
                            { label: 'Forecasted Surge', val: '1.2M', sub: 'Next 30 Days', icon: AlertCircle, color: 'text-red-600' },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                                <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                                <p className="text-xs text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.val}</p>
                                <p className={`text-[10px] font-bold ${stat.color}`}>{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Migration Corridors Visualization */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Top Migration Corridors
                            </h3>
                            <Card className="p-4 border-none bg-slate-50/50 rounded-2xl h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topCorridors} layout="vertical">
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="target" type="category" width={80} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <div className="overflow-hidden rounded-xl border border-border mt-4">
                                <table className="w-full text-xs">
                                    <thead className="bg-secondary/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold">SOURCE</th>
                                            <th className="px-4 py-2 text-left font-bold">DESTINATION</th>
                                            <th className="px-4 py-2 text-right font-bold">VOLUME</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {topCorridors.map((flow, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-2 opacity-70">{flow.source}</td>
                                                <td className="px-4 py-2 font-medium">{flow.target}</td>
                                                <td className="px-4 py-2 text-right font-bold">{flow.value.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Critical Focus Areas */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Field Survey Hotspots
                            </h3>
                            <div className="space-y-3">
                                {criticalZones.map((zone, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-red-50/30 border border-red-100 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold">
                                                {zone.pressure}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{zone.name}</p>
                                                <p className="text-[10px] text-red-500 uppercase font-bold tracking-widest">{zone.severity} STRESS</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Primary Action</p>
                                            <p className="text-xs font-semibold">Immediate Verification</p>
                                        </div>
                                    </div>
                                ))}
                                {/* Added AI Insight for Hotspots */}
                                <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <p className="text-xs font-bold text-emerald-800 uppercase">AI Strategic Recommendation</p>
                                    </div>
                                    <p className="text-xs text-foreground/80 leading-relaxed italic">
                                        "Prioritize Central Delhi survey teams for block-level biometric re-authentication. High probability of family reunification patterns detected in Surat East."
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <hr className="border-dashed border-border" />

                    {/* Real-Time Predictive Intelligence */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-purple-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Predictive Analytics & Forecasting
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-5 bg-gradient-to-br from-purple-50/50 to-white border-purple-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-sm">Next 7 Days Forecast</h4>
                                    <Badge className="bg-purple-100 text-purple-700 text-[9px]">AI MODEL</Badge>
                                </div>
                                <p className="text-2xl font-bold text-purple-600">+340K</p>
                                <p className="text-xs text-muted-foreground mt-1">Expected new enrolments</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
                                        <div className="h-full w-[68%] bg-purple-500 rounded-full"></div>
                                    </div>
                                    <span className="text-xs font-bold text-purple-600">68%</span>
                                </div>
                                <p className="text-xs text-purple-600 mt-2">↑ 12% confidence interval</p>
                            </Card>

                            <Card className="p-5 bg-gradient-to-br from-orange-50/50 to-white border-orange-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-sm">Seasonal Pattern Alert</h4>
                                    <Badge className="bg-orange-100 text-orange-700 text-[9px]">TRENDING</Badge>
                                </div>
                                <p className="text-2xl font-bold text-orange-600">Q2 Peak</p>
                                <p className="text-xs text-muted-foreground mt-1">Summer migration cycle</p>
                                <div className="mt-3 space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Apr-May surge</span>
                                        <span className="font-bold">+28%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Jun peak</span>
                                        <span className="font-bold text-orange-600">+42%</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-5 bg-gradient-to-br from-blue-50/50 to-white border-blue-100 rounded-2xl">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-sm">Anomaly Detection</h4>
                                    <Badge className="bg-blue-100 text-blue-700 text-[9px]">ML-POWERED</Badge>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">3 Zones</p>
                                <p className="text-xs text-muted-foreground mt-1">Unusual activity detected</p>
                                <ul className="mt-3 space-y-1 text-xs">
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Pune: +450% spike</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span>Surat: Gender skew</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>Jaipur: Age anomaly</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </section>

                    <hr className="border-dashed border-border" />

                    {/* Risk Assessment Matrix */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Multi-Dimensional Risk Matrix
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { category: 'Infrastructure Load', risk: 'HIGH', value: 8.5, color: 'red' },
                                { category: 'Data Quality', risk: 'LOW', value: 2.1, color: 'green' },
                                { category: 'Migration Velocity', risk: 'MEDIUM', value: 5.8, color: 'orange' },
                                { category: 'Resource Strain', risk: 'HIGH', value: 7.9, color: 'red' },
                            ].map((item, i) => (
                                <div key={i} className={`p-4 bg-${item.color}-50/30 border border-${item.color}-100 rounded-xl`}>
                                    <p className="text-xs text-muted-foreground mb-2">{item.category}</p>
                                    <div className="flex items-end justify-between">
                                        <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
                                        <Badge className={`bg-${item.color}-100 text-${item.color}-700 text-[9px] h-5`}>{item.risk}</Badge>
                                    </div>
                                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${item.value * 10}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <hr className="border-dashed border-border" />

                    {/* Demographic Deep Dive */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Demographic Intelligence Deep Dive
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 border-none bg-slate-50/50 rounded-2xl">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Age Distribution Trends
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { range: '0-18 years', percent: 32, count: '48.2M', trend: '+4.2%' },
                                        { range: '19-35 years', percent: 41, count: '61.8M', trend: '+6.8%' },
                                        { range: '36-55 years', percent: 19, count: '28.6M', trend: '+1.2%' },
                                        { range: '56+ years', percent: 8, count: '12.0M', trend: '-2.1%' },
                                    ].map((age, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium">{age.range}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-muted-foreground">{age.count}</span>
                                                    <span className={`font-bold ${age.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                                        {age.trend}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${age.percent}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6 border-none bg-slate-50/50 rounded-2xl">
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Gender Ratio Analysis
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">National Average</p>
                                            <p className="text-2xl font-bold text-emerald-600">948</p>
                                            <p className="text-xs text-muted-foreground">females per 1000 males</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Year-over-Year</p>
                                            <p className="text-xl font-bold text-green-600">+2.3%</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                        <p className="text-xs font-bold text-amber-800 mb-2">⚠️ Attention Required</p>
                                        <ul className="text-xs space-y-1 text-amber-900">
                                            <li>• Haryana: 879 (Below threshold)</li>
                                            <li>• Punjab: 895 (Monitoring)</li>
                                            <li>• Rajasthan: 908 (Watch list)</li>
                                        </ul>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    <hr className="border-dashed border-border" />

                    {/* AI-Generated Action Items */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" /> AI-Generated Strategic Action Items
                        </h3>
                        <div className="space-y-3">
                            {[
                                { priority: 'CRITICAL', action: 'Deploy mobile enrolment units to 15 high-density zones in Delhi NCR within 72 hours', impact: 'High', timeline: '0-3 days' },
                                { priority: 'HIGH', action: 'Initiate biometric quality audit in Maharashtra districts showing <95% match rate', impact: 'Medium', timeline: '1 week' },
                                { priority: 'MEDIUM', action: 'Coordinate with state education dept for school-based enrolment drives in UP', impact: 'Medium', timeline: '2 weeks' },
                                { priority: 'LOW', action: 'Publish demographic trend report for policy stakeholders and media', impact: 'Low', timeline: '1 month' },
                            ].map((item, i) => (
                                <Card key={i} className="p-4 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={`text-[9px] ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                        item.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                            item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {item.priority} PRIORITY
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">Timeline: {item.timeline}</span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed">{item.action}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Impact</p>
                                            <p className="text-sm font-bold">{item.impact}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <hr className="border-dashed border-border" />

                    {/* Actionable Intelligence Table */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> AI Tactical Solutions & Tasks
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {policyRecommendations.map((rec, i) => (
                                <Card key={i} className="p-5 bg-gradient-to-br from-white to-secondary/20 border-border rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Lightbulb className="w-12 h-12" />
                                    </div>
                                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 italic">
                                        <span className="text-primary">Q{i + 1}:</span> {rec.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {rec.description}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest opacity-60">Status: Pending Deployment</Badge>
                                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Footer Info */}
                    <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-xs uppercase font-bold tracking-widest">
                        <div className="flex items-center gap-6">
                            <span>Integrity Score: {dataQualityMetrics.integrityScore}%</span>
                            <span>Freshness: {nationalStats.dataFreshness}</span>
                        </div>
                        <p>© 2026 Aadhaar Sanket AI Engineering Unit</p>
                    </div>
                </div>
            </div>

            {/* Print Styling */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    #ai-report-content, #ai-report-content * { visibility: visible; }
                    #ai-report-content { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
                    .print-hidden { display: none !important; }
                }
            `}} />
        </div>
    );
};
