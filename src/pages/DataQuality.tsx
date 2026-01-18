import { useState } from 'react';
import { motion } from 'framer-motion';
import { dataQualityMetrics, dataLineage, nationalStats } from '@/data/realData';
import {
  Database, Shield, Clock, AlertCircle, CheckCircle, FileText,
  RefreshCw, Eye, Download, Filter, Activity, Layers, Zap
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';

const DataQuality = () => {
  const [selectedLineage, setSelectedLineage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'lineage' | 'health'>('metrics');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  const qualityGauges = [
    { name: 'Integrity', value: dataQualityMetrics.integrityScore, fill: 'hsl(160, 84%, 39%)', description: 'Data consistency across sources' },
    { name: 'Completeness', value: dataQualityMetrics.completeness, fill: 'hsl(199, 89%, 48%)', description: 'Missing values and nulls' },
    { name: 'Timeliness', value: dataQualityMetrics.timeliness, fill: 'hsl(30, 100%, 60%)', description: 'Data freshness and latency' },
    { name: 'Accuracy', value: dataQualityMetrics.accuracy, fill: 'hsl(280, 70%, 50%)', description: 'Correctness validation score' },
  ];

  const recordsData = [
    { name: 'Biometric', value: dataQualityMetrics.totalRecords.biometric, fill: 'hsl(30, 100%, 60%)' },
    { name: 'Demographic', value: dataQualityMetrics.totalRecords.demographic, fill: 'hsl(199, 89%, 48%)' },
    { name: 'Enrolment', value: dataQualityMetrics.totalRecords.enrolment, fill: 'hsl(160, 84%, 39%)' },
  ];

  // Health check logs
  const healthChecks = [
    { time: '14:45:02', check: 'Primary Database Connection', status: 'passed', duration: '23ms' },
    { time: '14:45:01', check: 'Data Pipeline Sync', status: 'passed', duration: '156ms' },
    { time: '14:44:58', check: 'API Response Validation', status: 'passed', duration: '45ms' },
    { time: '14:44:55', check: 'Schema Consistency Check', status: 'passed', duration: '89ms' },
    { time: '14:44:52', check: 'Anomaly Detection Scan', status: 'passed', duration: '1.2s' },
    { time: '14:44:50', check: 'Record Count Validation', status: 'passed', duration: '67ms' },
    { time: '14:44:48', check: 'Integrity Hash Verification', status: 'passed', duration: '234ms' },
    { time: '14:44:45', check: 'Backup Verification', status: 'passed', duration: '456ms' },
  ];

  const overallScore = ((dataQualityMetrics.integrityScore + dataQualityMetrics.completeness + dataQualityMetrics.timeliness + dataQualityMetrics.accuracy) / 4).toFixed(1);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Data Trust & Quality</h1>
            <p className="text-muted-foreground mt-1">Real-time monitoring of {formatNumber(dataQualityMetrics.totalRecords.biometric + dataQualityMetrics.totalRecords.demographic + dataQualityMetrics.totalRecords.enrolment)} records</p>
          </div>
          <div className="flex gap-2">
            {(['metrics', 'lineage', 'health'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-secondary hover:bg-accent'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Score Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-success/10 via-primary/5 to-info/10 border border-success/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-success/20">
                <Shield className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Data Quality Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-bold text-success">{overallScore}%</span>
                  <span className="text-sm text-success">Excellent</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                All systems operational
              </span>
              <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm hover:bg-secondary transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {activeTab === 'metrics' && (
          <>
            {/* Quality Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {qualityGauges.map((gauge, idx) => (
                <motion.div
                  key={gauge.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  className="card-elevated p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold text-foreground">{gauge.name}</h4>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={10} data={[gauge]} startAngle={180} endAngle={0}>
                        <RadialBar dataKey="value" cornerRadius={5} background={{ fill: 'hsl(40, 20%, 95%)' }} fill={gauge.fill} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center -mt-8">
                    <span className="text-3xl font-display font-bold text-foreground">{gauge.value}%</span>
                    <p className="text-xs text-muted-foreground mt-1">{gauge.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Records Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-elevated p-6">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">Records by Data Type</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recordsData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 90%)" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: number) => formatNumber(value)} contentStyle={{ borderRadius: '12px' }} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {recordsData.map((entry, idx) => (
                          <motion.rect key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="card-elevated p-6">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">Quality Metrics Details</h3>
                <div className="space-y-4">
                  {qualityGauges.map((g, idx) => (
                    <div key={g.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.fill }} />
                        <span className="text-sm font-medium text-foreground">{g.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${g.value}%` }}
                            transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: g.fill }}
                          />
                        </div>
                        <span className="text-sm font-bold text-foreground w-12 text-right">{g.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Anomaly Rate:</strong> {dataQualityMetrics.anomalyRate}% — Within acceptable threshold ({"<"}5%)
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {activeTab === 'lineage' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-foreground">Data Lineage</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-accent transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source File</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Records</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dataLineage.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{item.file}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{item.records}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.size}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.timestamp}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-success">
                          <CheckCircle className="w-4 h-4" />
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-semibold text-foreground">System Health Checks</h3>
              <span className="flex items-center gap-2 text-sm text-success">
                <Activity className="w-4 h-4" />
                Live Monitoring
              </span>
            </div>
            <div className="space-y-2">
              {healthChecks.map((check, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground font-mono">{check.time}</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-foreground">{check.check}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{check.duration}</span>
                    <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-lg capitalize">{check.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default DataQuality;