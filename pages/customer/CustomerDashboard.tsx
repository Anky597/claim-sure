import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container } from '../../components/ui';
import { CURRENT_CUSTOMER_USER } from '../../constants';
import { FilePlus, ChevronRight, Check, Clock, Loader2, FileText, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, endpoints } from '../../services/api';

const DashboardBackground: React.FC = () => (
   <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/60 to-transparent" />
   </div>
);

const CustomerDashboard: React.FC = () => {
   const [history, setHistory] = React.useState<any[]>([]);
   const [loadingHistory, setLoadingHistory] = React.useState(true);

   React.useEffect(() => {
      const fetchHistory = async () => {
         try {
            // In a real app, 'current_user' would be the actual ID
            const response = await api.get(endpoints.history('current_user'));
            if (response.data && response.data.accident_history) {
               setHistory(response.data.accident_history);
            }
         } catch (e) {
            console.error("Failed to fetch history", e);
         } finally {
            setLoadingHistory(false);
         }
      };
      fetchHistory();
   }, []);

   const steps = [
      { label: 'Submitted', status: 'complete', date: 'Oct 24, 9:00 AM' },
      { label: 'Analyzing', status: 'current', date: 'In Progress' },
      { label: 'Reviewing', status: 'upcoming', date: 'Est. Oct 25' },
      { label: 'Approved', status: 'upcoming', date: '--' },
   ];

   // Calculate progress width for the line (3 segments for 4 steps)
   const activeIndex = steps.findIndex(s => s.status === 'current');
   const progressWidth = `${(activeIndex / (steps.length - 1)) * 100}%`;

   return (
      <div className="min-h-screen font-sans text-slate-900 relative">
         <DashboardBackground />
         <Navbar title="My Dashboard" type="customer" />

         <Container className="max-w-5xl py-12">
            {/* Welcome Header */}
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-10"
            >
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Welcome back, {CURRENT_CUSTOMER_USER.name}
               </h1>
               <p className="text-slate-500 text-lg">
                  You are covered. Here is the latest on your activity.
               </p>
            </motion.div>

            {/* Active Claim Card */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white rounded-[2rem] p-1 shadow-xl shadow-slate-200/50 border border-white mb-10"
            >
               <div className="rounded-[1.8rem] p-6 sm:p-10">

                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                           </span>
                           <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Active Claim</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Front Bumper Damage</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">ID: #CLM-8821 • 2020 Honda Civic</p>
                     </div>
                     <div className="hidden sm:block">
                        <Link to="#" className="group flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-100 hover:border-blue-100">
                           View Full Details
                           <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                     </div>
                  </div>

                  {/* Progress Visual Tracker */}
                  <div className="relative mb-12 px-2 sm:px-4">
                     {/* Background Track */}
                     <div className="absolute top-[19px] left-0 w-full h-1.5 bg-slate-100 rounded-full -z-10" />

                     {/* Active Progress Bar */}
                     <div
                        className="absolute top-[19px] left-0 h-1.5 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all duration-1000 -z-0"
                        style={{ width: progressWidth }}
                     />

                     <div className="relative flex justify-between w-full">
                        {steps.map((step, idx) => {
                           const isComplete = step.status === 'complete';
                           const isCurrent = step.status === 'current';
                           const isUpcoming = step.status === 'upcoming';

                           return (
                              <div key={idx} className="flex flex-col items-center relative z-10 group cursor-default w-24 text-center">
                                 <div className={`
                                  w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 shadow-sm
                                  ${isComplete ? 'bg-blue-600 border-blue-600 shadow-blue-200' :
                                       isCurrent ? 'bg-white border-blue-500 shadow-blue-100 scale-110' :
                                          'bg-white border-slate-200'}
                               `}>
                                    {isComplete && <Check size={18} className="text-white" />}
                                    {isCurrent && <Loader2 size={20} className="text-blue-500 animate-spin" />}
                                    {isUpcoming && <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />}
                                 </div>

                                 <div className="mt-4 flex flex-col items-center">
                                    <span className={`text-sm font-bold transition-colors ${isCurrent ? 'text-blue-700' : isComplete ? 'text-slate-700' : 'text-slate-400'}`}>
                                       {step.label}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                                       {step.date}
                                    </span>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* Intelligent Insight Box */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-5 shadow-sm relative overflow-hidden">
                     {/* Decorative background element */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                     <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm">
                        <Clock size={24} />
                     </div>
                     <div className="relative z-10">
                        <h4 className="font-bold text-blue-900 text-base mb-1.5">Waiting for Police Report</h4>
                        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl mb-3">
                           Our AI agent "Sentinel" is currently syncing with the municipal database to retrieve the filed report.
                           This is typically automated and requires no action from you.
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-100/50 px-3 py-1.5 rounded-lg border border-blue-200/50">
                           <Loader2 size={12} className="animate-spin" />
                           Estimated completion: Tuesday, 4:00 PM
                        </div>
                     </div>
                  </div>

                  {/* Mobile View Details Button */}
                  <div className="block sm:hidden mt-6 pt-6 border-t border-slate-100">
                     <Link to="#" className="w-full flex items-center justify-center py-2.5 text-blue-600 font-semibold bg-white border border-slate-200 rounded-xl shadow-sm">
                        View Claim Details
                     </Link>
                  </div>
               </div>
            </motion.div>

            {/* New Claim Button */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="mb-16"
            >
               <Link to="/customer/new" className="block transform transition-transform active:scale-[0.99]">
                  <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-1 shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-1">
                     <div className="relative flex items-center justify-center gap-3 rounded-xl bg-transparent py-5 text-lg font-bold text-white transition-all">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                           <FilePlus className="w-5 h-5" />
                        </div>
                        Start a New Claim
                     </div>
                     {/* Shimmer Effect */}
                     <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent z-20" />
                  </button>
               </Link>
            </motion.div>

            {/* History Section */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
            >
               <div className="flex items-center justify-between mb-5 px-1">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Past History</h3>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Full Archive</button>
               </div>

               <div className="space-y-4">
                  {loadingHistory ? (
                     <div className="text-center py-8 text-slate-400">Loading history...</div>
                  ) : history.length === 0 ? (
                     <div className="text-center py-8 text-slate-400">No history found.</div>
                  ) : (
                     history.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                 <Check size={20} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-900 text-lg">{item.description || "Claim #" + (idx + 1)}</h4>
                                 <p className="text-xs font-medium text-slate-400">{item.date} • {item.status || "Closed"}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className="block font-bold text-slate-900 text-lg">${item.claim_amount?.toLocaleString() || "0.00"}</span>
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wide mt-1">
                                 Paid
                              </span>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </motion.div>

         </Container>
      </div>
   );
};

export default CustomerDashboard;