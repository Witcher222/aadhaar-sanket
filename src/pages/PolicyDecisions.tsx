import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { policyRecommendations, nationalStats, stressZones, migrationFlows } from '@/data/realData';
import { useToast } from '@/hooks/use-toast';
import {
  ThumbsUp, ThumbsDown, Clock, AlertTriangle, Users, Briefcase, Building2,
  GraduationCap, Heart, Car, Home, PackageOpen, Filter, ChevronRight,
  CheckCircle, XCircle, BarChart3, TrendingUp, Wallet
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['hsl(30, 100%, 60%)', 'hsl(160, 84%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(280, 70%, 50%)', 'hsl(340, 75%, 55%)', 'hsl(45, 93%, 47%)'];

const PolicyDecisions = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [policies, setPolicies] = useState(policyRecommendations.map(p => ({ ...p, decision: null as 'approved' | 'rejected' | null })));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Education': return <GraduationCap className="w-5 h-5" />;
      case 'Healthcare': return <Heart className="w-5 h-5" />;
      case 'Infrastructure': return <Building2 className="w-5 h-5" />;
      case 'Food Security': return <PackageOpen className="w-5 h-5" />;
      case 'Employment': return <Briefcase className="w-5 h-5" />;
      case 'Transport': return <Car className="w-5 h-5" />;
      case 'Housing': return <Home className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-info/10 text-info border-info/20';
    }
  };

  const handleApprove = (id: number) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, decision: 'approved' } : p));
    toast({ title: '✅ Policy Approved', description: 'Policy has been forwarded for implementation.' });
  };

  const handleReject = (id: number) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, decision: 'rejected' } : p));
    toast({ title: '❌ Policy Rejected', description: 'Policy has been marked for review.' });
  };

  const formatBudget = (budget: string) => budget;

  const filteredPolicies = filter === 'all' ? policies : policies.filter(p => p.category === filter);

  // Category distribution
  const categoryData = Array.from(new Set(policyRecommendations.map(p => p.category))).map(cat => ({
    name: cat,
    value: policyRecommendations.filter(p => p.category === cat).length,
  }));

  // Urgency distribution
  const urgencyData = [
    { name: 'Critical', value: policyRecommendations.filter(p => p.urgency === 'critical').length, fill: 'hsl(0, 84%, 60%)' },
    { name: 'High', value: policyRecommendations.filter(p => p.urgency === 'high').length, fill: 'hsl(45, 93%, 47%)' },
    { name: 'Medium', value: policyRecommendations.filter(p => p.urgency === 'medium').length, fill: 'hsl(199, 89%, 48%)' },
  ];

  // Total budget calculation
  const totalBudget = policyRecommendations.reduce((sum, p) => {
    const num = parseFloat(p.budget.replace('₹', '').replace(' Cr', ''));
    return sum + num;
  }, 0);

  const approvedCount = policies.filter(p => p.decision === 'approved').length;
  const rejectedCount = policies.filter(p => p.decision === 'rejected').length;
  const pendingCount = policies.filter(p => p.decision === null).length;

  const categories = ['all', ...Array.from(new Set(policyRecommendations.map(p => p.category)))];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Policy Decisions</h1>
            <p className="text-muted-foreground mt-1">AI-generated recommendations based on demographic analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 capitalize"
            >
              {categories.map(c => (
                <option key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10"><BarChart3 className="w-5 h-5 text-primary" /></div>
              <span className="text-sm text-muted-foreground">Total Recommendations</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{policyRecommendations.length}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-warning/10"><Wallet className="w-5 h-5 text-warning" /></div>
              <span className="text-sm text-muted-foreground">Total Budget</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">₹{totalBudget} Cr</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-success/10"><CheckCircle className="w-5 h-5 text-success" /></div>
              <span className="text-sm text-muted-foreground">Approved</span>
            </div>
            <p className="text-3xl font-display font-bold text-success">{approvedCount}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-elevated p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-info/10"><Clock className="w-5 h-5 text-info" /></div>
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-3xl font-display font-bold text-info">{pendingCount}</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-elevated p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">Category Distribution</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card-elevated p-6">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">Urgency Breakdown</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={urgencyData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 90%)" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {urgencyData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPolicies.map((policy, idx) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className={`card-elevated p-6 ${policy.decision === 'approved' ? 'ring-2 ring-success/50' : policy.decision === 'rejected' ? 'ring-2 ring-destructive/50 opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-xl ${getUrgencyColor(policy.urgency)}`}>
                    {getCategoryIcon(policy.category)}
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-lg uppercase ${getUrgencyColor(policy.urgency)}`}>
                    {policy.urgency}
                  </span>
                </div>

                <h4 className="font-display font-semibold text-foreground mb-2 line-clamp-2">{policy.title}</h4>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">{policy.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Impact</span>
                    <span className="font-medium text-foreground">{policy.impact}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-bold text-primary">{policy.budget}</span>
                  </div>
                </div>

                <div className="p-3 bg-secondary/30 rounded-xl mb-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Data Source:</strong> {policy.dataSource}
                  </p>
                </div>

                {policy.decision ? (
                  <div className={`flex items-center justify-center gap-2 py-2 rounded-xl ${policy.decision === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                    {policy.decision === 'approved' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span className="font-medium capitalize">{policy.decision}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(policy.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-success/10 text-success rounded-xl hover:bg-success/20 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(policy.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default PolicyDecisions;