import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  ThumbsUp, ThumbsDown, Clock, AlertTriangle, Users, Briefcase, Building2,
  GraduationCap, Heart, Car, Home, PackageOpen, Filter, ChevronRight, ChevronLeft,
  CheckCircle, XCircle, BarChart3, TrendingUp, Wallet, ArrowUpRight,
  Sparkles, Shield, Info, Activity, LayoutGrid, List as ListIcon
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { DataJustificationModal, MetricJustification } from '@/components/DataJustificationModal';

const COLORS = ['hsl(30, 100%, 60%)', 'hsl(160, 84%, 39%)', 'hsl(199, 89%, 48%)', 'hsl(280, 70%, 50%)', 'hsl(340, 75%, 55%)', 'hsl(45, 93%, 47%)'];

interface Policy {
  id: string;
  title: string;
  category: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  budget: string;
  dataSource: string;
  district: string;
  state: string;
  mvi: number;
  zone_type: string;
  trend_type: string;
  affected_population: number;
  priority: string;
  action_type: string;
  reasoning: string;
  justification_metadata: MetricJustification;
  decision?: 'approved' | 'rejected' | null;
  ai_effectiveness_score?: number;
  ai_rationale?: string;
}

interface ImpactMetrics {
  total_affected_population: number;
  total_budget: string;
  districts_covered: number;
  states_covered: number;
  by_priority: Record<string, number>;
  by_action_type: Record<string, number>;
}

const ITEMS_PER_PAGE = 9;

const PolicyDecisions = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJustification, setSelectedJustification] = useState<MetricJustification | null>(null);
  const [showJustification, setShowJustification] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [policiesRes, metricsRes, scoresRes] = await Promise.all([
        fetch('http://localhost:8000/api/policy/detailed'),
        fetch('http://localhost:8000/api/policy/impact-metrics'),
        fetch('http://localhost:8000/api/policy/effectiveness-score')
      ]);

      const policiesData = await policiesRes.json();
      const metricsData = await metricsRes.json();
      const scoresData = await scoresRes.json();

      if (policiesData.status === 'success') {
        let mergedPolicies = policiesData.policies.map((p: any) => ({
          ...p,
          decision: null
        }));

        if (scoresData.status === 'success') {
          const scoreMap = new Map(scoresData.scores.map((s: any) => [s.district, s]));
          mergedPolicies = mergedPolicies.map((p: any) => {
            const scoreInfo = scoreMap.get(p.district) as { effectiveness_score: number; ai_rationale: string } | undefined;
            return {
              ...p,
              ai_effectiveness_score: scoreInfo?.effectiveness_score,
              ai_rationale: scoreInfo?.ai_rationale
            };
          });
        }
        setPolicies(mergedPolicies);

        // Auto-select first category if Overview is likely empty (no critical/high priority)
        // Unique categories from data
        const uniqueCategories = Array.from(new Set(mergedPolicies.map((p: any) => String(p.category)))).sort();

        // Force 'Overview' to be first, then the rest
        const availableCategories = ['Overview', ...uniqueCategories.filter(c => c !== 'Overview')];

        // Only switch if we are NOT on a valid tab
        if (!availableCategories.includes(activeTab) && availableCategories.length > 0) {
          setActiveTab(availableCategories[0] as string);
        }
      }

      if (metricsData.status === 'success') {
        setMetrics(metricsData.metrics);
      }
    } catch (error) {
      console.error("Error fetching policy data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load policy recommendations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
    switch (urgency.toLowerCase()) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-info/10 text-info border-info/20';
    }
  };

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, decision: 'approved' } : p));
    toast({ title: '✅ Policy Approved', description: 'Marked for implementation.' });
  };

  const handleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, decision: 'rejected' } : p));
    toast({ title: '❌ Policy Rejected', description: 'Sent back for review.' });
  };

  const openJustification = (metadata: MetricJustification, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedJustification(metadata);
    setShowJustification(true);
  };

  // --- Filtering & Pagination Logic ---
  const uniqueCategories = Array.from(new Set(policies.map(p => p.category))).filter(c => c !== 'Overview').sort();
  const categories = ['Overview', ...uniqueCategories];

  const filteredPolicies = activeTab === 'Overview'
    ? policies.filter(p => p.priority === 'CRITICAL' || p.priority === 'HIGH') // Show top priority in overview
    : policies.filter(p => p.category === activeTab);

  const totalPages = Math.ceil(filteredPolicies.length / ITEMS_PER_PAGE);
  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const categoryData = metrics ? Object.entries(metrics.by_action_type || {}).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  })) : [];

  const urgencyData = metrics ? Object.entries(metrics.by_priority || {}).map(([name, value]) => ({
    name: name,
    value,
    fill: name === 'CRITICAL' ? 'hsl(0, 84%, 60%)' : name === 'HIGH' ? 'hsl(45, 93%, 47%)' : 'hsl(199, 89%, 48%)'
  })) : [];

  const pendingCount = policies.filter(p => p.decision === null).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Analyzing policy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Policy Decisions</h1>
            <div className="flex items-center gap-2 mt-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-muted-foreground">AI-Optimized Recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
              title="Table View"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Cards - Compact Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Active Policies */}
          <div className="card-elevated p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Policies</p>
              <p className="text-2xl font-bold mt-1">{policies.length}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          {/* Budget */}
          <div className="card-elevated p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Est. Budget</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{metrics?.total_budget}</p>
            </div>
            <div className="p-3 bg-warning/10 rounded-full text-warning">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Impact */}
          <div className="card-elevated p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Population Impact</p>
              <p className="text-2xl font-bold mt-1 text-success">{(metrics?.total_affected_population || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-full text-success">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Pending */}
          <div className="card-elevated p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl font-bold mt-1 text-info">{pendingCount}</p>
            </div>
            <div className="p-3 bg-info/10 rounded-full text-info">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-6 min-w-max px-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 px-1 ${activeTab === category
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Charts Section (Only on Overview Tab) */}
      {activeTab === 'Overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="card-elevated p-6">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-muted-foreground" />
              Category Distribution
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {categoryData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-elevated p-6">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Priority Breakdown
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={urgencyData} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} width={60} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {urgencyData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {activeTab === 'Overview' ? 'High Priority Recommendations' : `${activeTab} Policies`}
          </h2>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
            Showing {paginatedPolicies.length} of {filteredPolicies.length}
          </span>
        </div>

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {paginatedPolicies.map((policy) => (
                <motion.div
                  layout
                  key={policy.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card-elevated p-5 relative group bg-white border border-border/50 hover:border-primary/20 transition-all ${policy.decision === 'approved' ? 'ring-1 ring-success/30 bg-success/5' : ''
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg ${getUrgencyColor(policy.urgency)}`}>
                      {getCategoryIcon(policy.category)}
                    </div>
                    {policy.ai_effectiveness_score && (
                      <div className="flex items-center gap-1 bg-violet-50 text-violet-700 px-2 py-1 rounded text-[10px] font-bold border border-violet-100">
                        <Sparkles className="w-3 h-3" />
                        SCORE: {policy.ai_effectiveness_score.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem] mb-2">{policy.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {policy.district}, {policy.state}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-secondary/30 p-2 rounded">
                      <span className="text-muted-foreground block mb-0.5">Budget</span>
                      <span className="font-medium">{policy.budget}</span>
                    </div>
                    <div className="bg-secondary/30 p-2 rounded">
                      <span className="text-muted-foreground block mb-0.5">MVI</span>
                      <span className="font-medium">{policy.mvi.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/40">
                    <button
                      onClick={(e) => openJustification(policy.justification_metadata, e)}
                      className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    {!policy.decision ? (
                      <div className="flex gap-2 flex-1 justify-end">
                        <button
                          onClick={(e) => handleReject(policy.id, e)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleApprove(policy.id, e)}
                          className="px-3 py-1.5 bg-success/10 text-success hover:bg-success/20 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      </div>
                    ) : (
                      <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${policy.decision === 'approved' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                        {policy.decision === 'approved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {policy.decision}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="card-elevated overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/30 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3">Policy</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-[250px] truncate" title={policy.title}>
                      {policy.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{policy.district}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {getCategoryIcon(policy.category)} {policy.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">{policy.budget}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getUrgencyColor(policy.urgency)}`}>
                        {policy.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={(e) => openJustification(policy.justification_metadata, e)} className="text-muted-foreground hover:text-primary"><Info className="w-4 h-4" /></button>
                        {!policy.decision && (
                          <>
                            <button onClick={(e) => handleApprove(policy.id, e)} className="text-success hover:bg-success/10 p-1 rounded"><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={(e) => handleReject(policy.id, e)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><XCircle className="w-4 h-4" /></button>
                          </>
                        )}
                        {policy.decision && (
                          <span className={`text-xs capitalize font-medium ${policy.decision === 'approved' ? 'text-success' : 'text-destructive'}`}>{policy.decision}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-medium text-muted-foreground">
              Page <span className="text-foreground">{currentPage}</span> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {selectedJustification && (
        <DataJustificationModal
          isOpen={showJustification}
          onClose={() => setShowJustification(false)}
          metric={selectedJustification}
        />
      )}
    </div>
  );
};

export default PolicyDecisions;