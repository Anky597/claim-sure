import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, StatusBadge, Button } from '../../components/ui';
import { mockClaims } from '../../constants';
import { api, endpoints, safeRequest } from '../../services/api';
import { ClientHistoryResponse, ClaimStatus } from '../../types';
import { Filter, Search, RefreshCw, AlertOctagon, Zap, Inbox, ArrowUpRight, ChevronDown, MoreHorizontal, LayoutList, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardBackground: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/50 to-transparent" />
        {/* Subtle Grid Pattern */}
        <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
    </div>
);

const EmployeeDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'risk' | 'approved'>('all');
    const [claims, setClaims] = useState(mockClaims);

    const fetchHistory = async () => {
        setLoading(true);
        const data = await safeRequest<ClientHistoryResponse | null>(
            api.get(endpoints.history('client_123')),
            null
        );

        if (data && data.accident_history) {
            const backendClaims = data.accident_history.map(item => ({
                id: item.id || `CLM-${Math.floor(Math.random() * 1000)}`,
                customer: "Backend User",
                status: ClaimStatus.Analyzing,
                riskScore: data.risk_score || 50,
                timePending: "New",
                vehicle: "Unknown",
                summary: item.description,
                estimate: item.amount
            }));
            setClaims([...backendClaims, ...mockClaims]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredClaims = claims.filter(c => {
        if (activeTab === 'risk') return c.riskScore > 50;
        if (activeTab === 'approved') return c.status === ClaimStatus.Approved || c.status === ClaimStatus.ReadyForApproval;
        return true;
    });

    return (
        <div className="min-h-screen font-sans text-slate-900 relative">
            <DashboardBackground />
            <Navbar title="Adjuster Workspace" type="employee" />

            <Container className="py-10 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Command Center</h1>
                        <p className="text-slate-500 mt-1">Real-time oversight of intake queues and AI analysis.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            Last sync: Just now
                        </span>
                        <Button variant="primary" size="sm" className="shadow-lg shadow-blue-500/20">
                            + New Assignment
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Stat Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Inbox size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <ArrowUpRight size={12} className="mr-1" /> 12%
                            </span>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{claims.length}</div>
                            <div className="text-sm text-slate-500 font-medium">Claims in Queue</div>
                            <div className="text-xs text-red-500 mt-2 font-medium">2 Overdue ({'>'}4h)</div>
                        </div>
                    </motion.div>

                    {/* Stat Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-50 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <AlertOctagon size={24} />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">3</div>
                            <div className="text-sm text-slate-500 font-medium">Fraud Alerts</div>
                            <div className="text-xs text-slate-400 mt-2">Requires SIU Review</div>
                        </div>
                    </motion.div>

                    {/* Stat Card 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Zap size={24} />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                Today
                            </span>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">28</div>
                            <div className="text-sm text-slate-500 font-medium">Auto-Approved</div>
                            <div className="text-xs text-slate-400 mt-2">$42k Volume Processed</div>
                        </div>
                    </motion.div>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
                        {['all', 'risk', 'approved'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`
                            px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize
                            ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                        `}
                            >
                                {tab === 'risk' ? 'High Risk' : tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80 mr-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search claims..."
                            className="w-full pl-10 pr-4 py-2.5 border-none bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 font-medium"
                        />
                    </div>
                </div>

                {/* Claims Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Claim Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Analysis</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredClaims.map((claim, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => navigate(`/employee/claim/${claim.id}`)}
                                        className="group hover:bg-slate-50/80 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                    {claim.customer.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{claim.customer}</div>
                                                    <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                        {claim.id} <span className="text-slate-300">•</span> {claim.vehicle}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={claim.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[140px]">
                                                <div className="flex justify-between text-xs mb-1.5 font-bold">
                                                    <span className={claim.riskScore > 50 ? 'text-red-500' : 'text-slate-600'}>Score</span>
                                                    <span className={claim.riskScore > 50 ? 'text-red-600' : 'text-emerald-600'}>{claim.riskScore}/100</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${claim.riskScore > 75 ? 'bg-red-500' :
                                                                claim.riskScore > 40 ? 'bg-amber-400' : 'bg-emerald-500'
                                                            }`}
                                                        style={{ width: `${claim.riskScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm font-medium ${claim.timePending.includes('5h') ? 'text-red-600' : 'text-slate-600'}`}>
                                                {claim.timePending}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination / Footer */}
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                        <span>Showing {filteredClaims.length} of {claims.length} claims</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:border-slate-300 shadow-sm transition-colors">Previous</button>
                            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:border-slate-300 shadow-sm transition-colors">Next</button>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default EmployeeDashboard;