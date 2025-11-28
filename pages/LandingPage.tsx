
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search, ShieldAlert, ArrowRight, FileText, Zap, Mic, ShieldCheck, Gavel, ExternalLink, Database, Server, X, Upload, Calendar, Globe, BrainCircuit, Stethoscope, FileJson, ChevronRight, Lock, Eye, XCircle, ArrowDown } from 'lucide-react';
import { Button } from '../components/ui';

// --- Pipeline Component ---

const PipelineNode: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  isCompleted: boolean;
  align?: 'top' | 'bottom'; 
}> = ({ title, description, icon, isActive, isCompleted, align = 'top' }) => {
  return (
    <div className={`relative flex flex-col items-center z-10 w-48 transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100 opacity-60'}`}>
      {/* Glow Effect */}
      {isActive && (
        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
      )}
      
      {/* Node Box */}
      <motion.div 
        className={`
          relative bg-slate-900 border-2 rounded-xl p-4 w-full shadow-2xl backdrop-blur-sm
          ${isActive ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.3)]' : 'border-slate-700'}
          ${isCompleted ? 'border-green-900' : ''}
        `}
        initial={false}
        animate={{ borderColor: isActive ? '#4ade80' : isCompleted ? '#14532d' : '#334155' }}
      >
        <div className="flex items-center gap-3 mb-2">
           <div className={`p-2 rounded-lg ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
             {icon}
           </div>
           <div className={`w-2 h-2 rounded-full ml-auto ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-700'}`} />
        </div>
        <h4 className={`font-bold text-sm mb-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>{title}</h4>
        <p className="text-[10px] text-slate-500 leading-tight">{description}</p>
      </motion.div>

      {/* Status Dot for Connection */}
      <div className={`absolute ${align === 'top' ? '-bottom-1.5' : '-top-1.5'} w-3 h-3 rounded-full border-2 border-slate-900 z-20 ${isActive || isCompleted ? 'bg-green-500' : 'bg-slate-700'}`} />
    </div>
  );
};

const PipelineConnection: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="flex-1 h-[2px] bg-slate-800 relative mx-2 self-center overflow-hidden">
      {/* Background Line */}
      <div className="absolute inset-0 border-t-2 border-dashed border-slate-700/50" />
      
      {/* Active Moving Particle */}
      {isActive && (
        <motion.div 
          className="absolute top-[-4px] left-0 w-8 h-2 bg-gradient-to-r from-transparent via-green-400 to-transparent blur-[1px]"
          animate={{ left: ['0%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
};

const ArchitectureDiagram: React.FC<{ activeStep: number }> = ({ activeStep }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-12 relative">
      {/* Background Grid */}
      <div className="absolute inset-0" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      <div className="flex justify-between items-stretch relative">
        
        {/* Step 1: Ingest */}
        <PipelineNode 
          title="Intake" 
          description="Capture audio, images & device metadata"
          icon={<FileJson size={16} />}
          isActive={activeStep === 0}
          isCompleted={activeStep > 0}
        />

        <PipelineConnection isActive={activeStep === 0} />

        {/* Step 2: Context Retrieval */}
        <PipelineNode 
          title="Context Retrieval" 
          description="Fetch Police, Hospital & Maps Grounding"
          icon={<Globe size={16} />}
          isActive={activeStep === 1}
          isCompleted={activeStep > 1}
        />

        <PipelineConnection isActive={activeStep === 1} />

        {/* Step 3: AI Reasoning */}
        <PipelineNode 
          title="AI Reasoning" 
          description="Fraud Check & Cost Estimation"
          icon={<BrainCircuit size={16} />}
          isActive={activeStep === 2}
          isCompleted={activeStep > 2}
        />

        <PipelineConnection isActive={activeStep === 2} />

        {/* Step 4: Resolution */}
        <PipelineNode 
          title="Resolution" 
          description="Instant Payout or SIU Referral"
          icon={<Gavel size={16} />}
          isActive={activeStep === 3}
          isCompleted={activeStep > 3}
        />

      </div>

      {/* Terminal Output Area */}
      <div className="mt-16 bg-slate-900/80 rounded-lg border border-slate-800 p-4 font-mono text-xs shadow-2xl max-w-2xl mx-auto">
        <div className="flex gap-1.5 mb-3 border-b border-slate-800 pb-2">
           <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
           <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
           <span className="ml-2 text-slate-500">pipeline_execution.log</span>
        </div>
        <div className="space-y-1 text-slate-400">
           <div className={activeStep === 0 ? "text-green-400" : "opacity-50"}>
              <span className="text-slate-600">[09:00:01]</span> INTAKE: Processing raw voice stream & photo buffer...
           </div>
           <div className={activeStep === 1 ? "text-green-400" : "opacity-50"}>
              <span className="text-slate-600">[09:00:03]</span> RETRIEVAL: Querying Ext. APIs...
              {activeStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-6 text-slate-500">
                   ├─ GET /police-records/v2/search?loc=34.05,-118.25 <br/>
                   ├─ GET /hospital-records/patient?id=8821 <br/>
                   └─ GET /maps/grounding?query=intersection_validity
                </motion.div>
              )}
           </div>
           <div className={activeStep === 2 ? "text-green-400" : "opacity-50"}>
              <span className="text-slate-600">[09:00:05]</span> AI_CORE: Cross-referencing evidence. Fraud Risk: LOW. Estimate: $1,450.
           </div>
           <div className={activeStep === 3 ? "text-green-400" : "opacity-50"}>
              <span className="text-slate-600">[09:00:08]</span> RESOLUTION: Auto-Approval Policy Triggered. Payout Scheduled.
           </div>
           {activeStep === 3 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-400 font-bold mt-2">
                &gt; CLAIM CLOSED SUCCESSFULLY.
             </motion.div>
           )}
        </div>
      </div>

    </div>
  );
};

// --- Mock Visual Components ---

const MockTraditionalForm: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-100 p-4 sm:p-8 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
        {/* Window Header */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-2">
           <div className="flex gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-400/60" />
             <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
             <div className="w-3 h-3 rounded-full bg-green-400/60" />
           </div>
           <div className="flex-1 bg-white rounded border border-slate-200 h-6 mx-2 text-[10px] text-slate-400 flex items-center px-2">
             insurance-portal.legacy.com/claims/new_v1.aspx
           </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 relative">
          <div className="h-6 w-1/3 bg-slate-200 rounded mb-6" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-4 bg-red-200 rounded-full" />
            </div>
            <div className="h-10 w-full border border-slate-200 rounded bg-slate-50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <div className="h-3 w-16 bg-slate-200 rounded" />
               <div className="h-10 w-full border border-slate-200 rounded bg-slate-50 flex items-center px-3 text-slate-300">
                 <Calendar size={14} />
               </div>
             </div>
             <div className="space-y-2">
               <div className="h-3 w-16 bg-slate-200 rounded" />
               <div className="h-10 w-full border border-slate-200 rounded bg-slate-50" />
             </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-24 w-full border border-slate-200 rounded bg-slate-50 p-2">
                <div className="h-2 w-full bg-slate-100 rounded mb-2" />
                <div className="h-2 w-3/4 bg-slate-100 rounded mb-2" />
                <div className="h-2 w-5/6 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-24 w-full border-2 border-dashed border-slate-300 rounded bg-slate-50 flex flex-col items-center justify-center gap-2">
                <Upload size={20} className="text-slate-300" />
                <div className="h-2 w-20 bg-slate-200 rounded" />
            </div>
          </div>

           <div className="space-y-2 opacity-50">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-10 w-full border border-slate-200 rounded bg-slate-50" />
          </div>
        </div>
        
        {/* Scrollbar overlay to emphasize manual nature */}
        <div className="absolute right-4 sm:right-8 top-[120px] bottom-[60px] w-1.5 bg-slate-200/50 rounded-full">
            <div className="w-full h-1/4 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  )
}

const MockVoiceVisual: React.FC = () => {
  return (
    <div className="w-full h-full bg-blue-50/50 p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
       {/* Background Elements */}
       <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20" />
       
       {/* Central Interface */}
       <div className="relative z-10 w-full max-w-sm">
          {/* Main Orb */}
          <div className="flex justify-center mb-10">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center relative z-10">
                   <Mic className="text-white w-10 h-10" />
                </div>
                {/* Ripples */}
                <div className="absolute inset-[-10px] border border-blue-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-[-20px] border border-blue-400/10 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
             </div>
          </div>

          {/* Transcript Bubbles */}
          <div className="space-y-3 px-4">
             <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 0.2 }}
               className="bg-white/80 backdrop-blur rounded-2xl rounded-tl-none p-4 shadow-sm border border-blue-100"
             >
               <p className="text-sm text-slate-700">"I was driving on I-95 when..."</p>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 1 }}
               className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 shadow-md ml-auto max-w-[80%]"
             >
               <div className="flex items-center gap-2">
                 <div className="flex gap-1 h-3 items-end">
                    <div className="w-1 bg-white/50 h-2 animate-bounce" />
                    <div className="w-1 bg-white/50 h-3 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 bg-white/50 h-1 animate-bounce" style={{ animationDelay: '0.2s' }} />
                 </div>
                 <p className="text-sm font-medium">Processing incident...</p>
               </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 2.5 }}
               className="bg-emerald-50 rounded-2xl p-3 shadow-sm border border-emerald-100 flex items-center gap-3"
             >
               <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                 <ShieldCheck size={16} />
               </div>
               <div>
                  <p className="text-xs font-bold text-emerald-800">Claim #CLM-9921 Created</p>
                  <p className="text-xs text-emerald-600">Evidence attached automatically.</p>
               </div>
             </motion.div>
          </div>
       </div>
    </div>
  )
}

// --- Main Page Component ---

const HeroBackground: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-[128px]" />
    </div>
  );
  
  const TiltCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    // Simple wrapper without the 3D tilt logic for cleaner code
    return (
      <div className={`transition-all duration-200 hover:-translate-y-1 ${className}`}>
        {children}
      </div>
    );
  };

const LandingPage: React.FC = () => {
  const [isNewWay, setIsNewWay] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance the simulation step
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen font-sans text-slate-900 relative">
      <HeroBackground />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto sticky top-0 bg-white/50 backdrop-blur-md z-50 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">C</div>
          <span className="text-xl font-bold tracking-tight">ClaimSight</span>
        </div>
        <div className="flex gap-4">
          <Link to="/employee">
            <span className="text-sm font-medium text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">Adjuster Login</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 pt-12 pb-20 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100/50 backdrop-blur border border-blue-200 text-blue-700 text-sm font-semibold mb-6 shadow-sm">
              New: Voice AI Assistant
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
              The AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Claims Operating System.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-0 max-w-2xl mx-auto leading-relaxed">
              We replace bureaucratic friction with computer vision and voice intelligence. <br/>
              Reduce settlement times by 95% and stop fraud before it happens.
            </p>
          </motion.div>
        </div>

        {/* 1. Login Cards - Keep these prominent as per UX */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          <TiltCard className="h-full">
            <Link to="/customer" className="block h-full">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xl h-full flex flex-col justify-between group hover:border-blue-400 transition-colors">
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">For Policyholders</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    File a claim in seconds using our Voice Assistant or track your existing claim status in real-time.
                  </p>
                </div>
                <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                  File or Track Claim <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
            </Link>
          </TiltCard>

          <TiltCard className="h-full">
            <Link to="/employee" className="block h-full">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xl h-full flex flex-col justify-between group hover:border-emerald-400 transition-colors">
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">For Adjusters</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    Access the command center for high-density data analysis, AI fraud checks, and rapid approvals.
                  </p>
                </div>
                <div className="flex items-center text-emerald-600 font-bold group-hover:translate-x-2 transition-transform">
                  Employee SSO <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
            </Link>
          </TiltCard>
        </div>

        {/* 2. Problem/Solution Deep Dive Section - REDESIGNED */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-slate-50/50 -z-10 skew-y-3" />
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Built to solve the <span className="text-red-500">insurance crisis.</span></h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                The traditional claims process is manual, slow, and vulnerable. ClaimSight replaces the paperwork with intelligence.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1: Speed */}
              <div className="group relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:-translate-y-1 transition-all duration-300">
                <div className="p-8 pb-0">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                     <Clock size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Speed</h3>
                  <p className="text-slate-500 font-medium mb-3">From weeks to minutes.</p>
                  <a href="#" className="inline-flex items-center text-[10px] text-slate-400 hover:text-blue-600 mb-8 transition-colors">
                     Source: Sosa Report <ExternalLink size={10} className="ml-1" />
                  </a>
                </div>
                
                {/* Comparison Stack */}
                <div className="flex flex-col">
                  {/* Old Way */}
                  <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 relative">
                     <div className="absolute left-8 top-6 w-1 h-full bg-slate-200" />
                     <div className="relative pl-6">
                        <div className="flex items-center gap-2 mb-2">
                           <XCircle size={16} className="text-slate-400" />
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">The Old Way</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Adjusters manually drive to sites, take notes, and spend 5-10 days writing estimates.
                        </p>
                     </div>
                  </div>

                  {/* New Way */}
                  <div className="px-8 py-6 bg-white border-t border-slate-100 relative group-hover:bg-blue-50/30 transition-colors">
                     <div className="absolute left-8 top-6 w-1 h-full bg-blue-500" />
                     <div className="absolute -top-3 left-[26px] bg-white border border-slate-200 p-1 rounded-full z-10 text-slate-400">
                        <ArrowDown size={12} />
                     </div>
                     <div className="relative pl-6">
                        <div className="flex items-center gap-2 mb-2">
                           <Zap size={16} className="text-blue-600" />
                           <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">The ClaimSight Way</span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                          Computer vision analyzes photos in <span className="text-blue-600 font-bold">400ms</span>, generating line-item estimates instantly.
                        </p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Transparency (similar structure) */}
               <div className="group relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:-translate-y-1 transition-all duration-300">
                <div className="p-8 pb-0">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                     <Search size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Transparency</h3>
                  <p className="text-slate-500 font-medium mb-3">No more black boxes.</p>
                  <a href="#" className="inline-flex items-center text-[10px] text-slate-400 hover:text-blue-600 mb-8 transition-colors">
                     Source: Insurance Mag <ExternalLink size={10} className="ml-1" />
                  </a>
                </div>
                
                {/* Comparison Stack */}
                <div className="flex flex-col">
                  {/* Old Way */}
                  <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 relative">
                     <div className="absolute left-8 top-6 w-1 h-full bg-slate-200" />
                     <div className="relative pl-6">
                        <div className="flex items-center gap-2 mb-2">
                           <XCircle size={16} className="text-slate-400" />
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">The Old Way</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                           Policyholders wait in the dark with zero visibility, leading to anxiety and support calls.
                        </p>
                     </div>
                  </div>

                  {/* New Way */}
                  <div className="px-8 py-6 bg-white border-t border-slate-100 relative group-hover:bg-indigo-50/30 transition-colors">
                     <div className="absolute left-8 top-6 w-1 h-full bg-indigo-500" />
                     <div className="absolute -top-3 left-[26px] bg-white border border-slate-200 p-1 rounded-full z-10 text-slate-400">
                        <ArrowDown size={12} />
                     </div>
                     <div className="relative pl-6">
                        <div className="flex items-center gap-2 mb-2">
                           <Eye size={16} className="text-indigo-600" />
                           <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">The ClaimSight Way</span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                          Real-time visual trackers and AI chatbots keep policyholders informed <span className="text-indigo-600 font-bold">24/7</span>.
                        </p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Fraud (similar structure) */}
               <div className="group relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:-translate-y-1 transition-all duration-300">
                <div className="p-8 pb-0">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                     <ShieldAlert size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Integrity</h3>
                  <p className="text-slate-500 font-medium mb-3">Stop fraud at the door.</p>
                  <a href="#" className="inline-flex items-center text-[10px] text-slate-400 hover:text-blue-600 mb-8 transition-colors">
                     Source: Arxiv 2404.09690 <ExternalLink size={10} className="ml-1" />
                  </a>
                </div>
                
                {/* Comparison Stack */}
                <div className="flex flex-col">
                  {/* Old Way */}
                  <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 relative">
                     <div className="absolute left-8 top-6 w-1 h-full bg-slate-200" />
                     <div className="relative pl-6">
                        <div className="flex items-center gap-2 mb-2">
                           <XCircle size={16} className="text-slate-400" />
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">The Old Way</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                           Human reviewers miss pixel-perfect Deepfakes and recycled metadata patterns.
                        </p>
                     </div>
                  </div>

                  {/* New Way */}
                  <div className="px-8 py-6 bg-white border-t border-slate-100 relative group-hover:bg-red-50/30 transition-colors">
                     <div className="absolute left-8 top-6 w-1 h-full bg-red-500" />
                     <div className="absolute -top-3 left-[26px] bg-white border border-slate-200 p-1 rounded-full z-10 text-slate-400">
                        <ArrowDown size={12} />
                     </div>
                     <div className="relative pl-6">
                        <div className="flex items-center gap-2 mb-2">
                           <Lock size={16} className="text-red-600" />
                           <span className="text-xs font-bold text-red-600 uppercase tracking-wider">The ClaimSight Way</span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium leading-relaxed">
                          Forensic AI detects synthetic artifacts and validates metadata <span className="text-red-600 font-bold">authenticity</span>.
                        </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      {/* The 2D Architectural Flow Diagram */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative border-y border-slate-900">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs font-mono text-slate-400 mb-4">
               SYSTEM_ARCHITECTURE_V2
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">The ClaimSight Flow</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              How we compress days of work into minutes.
            </p>
          </div>
          
          <ArchitectureDiagram activeStep={activeStep} />

        </div>
      </section>

      {/* The Solution Toggle */}
      <section className="py-24 px-6 bg-slate-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-6">Experience the Difference</h2>
            
            {/* Toggle Switch */}
            <div className="inline-flex bg-white p-1 rounded-full border border-slate-200 relative shadow-sm">
              <div className="absolute inset-0 flex">
                <motion.div 
                  className="w-1/2 h-full rounded-full shadow-sm m-0"
                  layout
                  initial={false}
                  animate={{ 
                    x: isNewWay ? '100%' : '0%',
                    backgroundColor: isNewWay ? '#2563EB' : '#f1f5f9' 
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
              <button 
                onClick={() => setIsNewWay(false)}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors w-40 ${!isNewWay ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`}
              >
                Traditional Form
              </button>
              <button 
                onClick={() => setIsNewWay(true)}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors w-40 ${isNewWay ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`}
              >
                Voice AI Agent
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
             <AnimatePresence mode='wait'>
                {isNewWay ? (
                  <motion.div 
                    key="new"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row w-full h-full"
                  >
                     <div className="p-10 md:w-5/12 flex flex-col justify-center bg-blue-50/30 border-r border-blue-50">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                          <Mic size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Conversational Intake</h3>
                        <p className="text-slate-700 mb-8 leading-relaxed">
                            "Just tell me what happened." No forms to fill out. Our AI interviews you, extracts the data, and files the claim instantly.
                        </p>
                        <Link to="/customer/new" className="w-full">
                             <Button className="w-full py-3 text-base shadow-lg shadow-blue-500/20">Try Voice Demo</Button>
                        </Link>
                     </div>
                     <div className="md:w-7/12 bg-white relative">
                        <MockVoiceVisual />
                     </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="old"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row w-full h-full"
                  >
                     <div className="p-10 md:w-5/12 flex flex-col justify-center bg-slate-50 border-r border-slate-200">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6 text-slate-500">
                          <FileText size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Manual Entry</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                           Typing out descriptions, selecting dates from calendars, and manually uploading photos one by one. Slow and tedious.
                        </p>
                         <Button variant="outline" disabled className="w-full py-3 opacity-50 cursor-not-allowed">
                            Legacy Portal
                         </Button>
                     </div>
                     <div className="md:w-7/12 bg-slate-100 relative">
                        <MockTraditionalForm />
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </section>

      <footer className="bg-white py-10 border-t border-slate-100 text-center text-slate-400 text-sm">
        &copy; 2024 ClaimSight Inc. Built for trust.
      </footer>
    </div>
  );
};

export default LandingPage;
