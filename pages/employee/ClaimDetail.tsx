import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar, StatusBadge, Button, Card } from '../../components/ui';
import { mockClaims } from '../../constants';
import { api, endpoints, safeRequest } from '../../services/api';
import { FraudAnalysisResponse, EstimationResponse } from '../../types';
import { ShieldAlert, CheckCircle, FileText, BadgeAlert, Coins, MessageSquare, AlertOctagon, Loader2 } from 'lucide-react';

const ClaimDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Start with mock data, but allow overriding with API data
  const baseClaim = mockClaims.find(c => c.id === id) || mockClaims[0];
  
  const [analysis, setAnalysis] = useState<FraudAnalysisResponse | null>(null);
  const [estimate, setEstimate] = useState<EstimationResponse | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const runFraudAnalysis = async () => {
      setLoadingAnalysis(true);
      const payload = { 
          user_submission: { description: baseClaim.summary }, 
          location: "Los Angeles, CA" 
      };
      
      const result = await safeRequest<FraudAnalysisResponse | null>(
          api.post(endpoints.analyze, payload),
          { analysis_result: { score: 0.1, reasoning_behind_score: "Simulated Backend: Metadata consistent with location." } } // Fallback
      );
      
      if (result) setAnalysis(result);
      setLoadingAnalysis(false);
  };

  const generateEstimate = async () => {
      setLoadingEstimate(true);
      const payload = { damage_analysis: ["Bumper", "Tail Light"] };
      
      const result = await safeRequest<EstimationResponse | null>(
          api.post(endpoints.calculate, payload),
          { summary: { total: 1450.00 }, line_items: [{ part: "Bumper", action: "Replace", cost: 800 }, { part: "Paint", action: "Repair", cost: 650 }] } // Fallback
      );

      if (result) setEstimate(result);
      setLoadingEstimate(false);
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      <Navbar title={`Claim ${baseClaim.id}`} backLink="/employee" type="employee" />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PANEL: EVIDENCE */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-slate-200 bg-white">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={14} /> Evidence Locker
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {[1, 2].map((i) => (
                    <div key={i} className="relative group aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img 
                            src={`https://picsum.photos/400?random=${i + parseInt(baseClaim.id.split('-')[1])}`} 
                            alt="Damage evidence" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Narrative</h3>
                <p className="text-sm text-blue-800 italic">"{baseClaim.summary}"</p>
            </div>
        </div>

        {/* RIGHT PANEL: AI COPILOT */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto bg-slate-50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={14} /> AI Adjuster Copilot
                </h2>
                <StatusBadge status={baseClaim.status} />
            </div>

            {/* Fraud Analysis Section */}
            <div className="mb-6">
                 {!analysis ? (
                     <Card className="flex items-center justify-between p-4 bg-white">
                        <div className="flex items-center gap-3">
                            <AlertOctagon className="text-slate-400" />
                            <span className="font-medium text-slate-700">Fraud Analysis Required</span>
                        </div>
                        <Button size="sm" onClick={runFraudAnalysis} disabled={loadingAnalysis}>
                            {loadingAnalysis && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
                            Run Intelligence
                        </Button>
                     </Card>
                 ) : (
                    <Card className={`mb-6 border-l-4 ${analysis.analysis_result.score > 0.5 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <div className="text-sm text-slate-500 mb-1">Risk Score</div>
                                <div className="text-2xl font-bold text-slate-900">{analysis.analysis_result.score.toFixed(2)}</div>
                            </div>
                            {analysis.analysis_result.score > 0.5 ? <BadgeAlert className="text-red-500" /> : <CheckCircle className="text-emerald-500" />}
                        </div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{analysis.analysis_result.reasoning_behind_score}</p>
                    </Card>
                 )}
            </div>

            {/* Estimate Builder Section */}
            <div className="mb-8">
                 <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                    <Coins size={16} className="mr-2 text-blue-500" /> AI Estimate
                </h3>
                
                {!estimate ? (
                    <div className="bg-white p-8 rounded-lg border border-slate-200 border-dashed text-center">
                        <p className="text-slate-400 mb-4">No estimate generated yet.</p>
                        <Button variant="outline" onClick={generateEstimate} disabled={loadingEstimate}>
                            {loadingEstimate && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
                            Generate Calculation
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Part</th>
                                    <th className="px-4 py-2 font-medium">Action</th>
                                    <th className="px-4 py-2 font-medium text-right">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {estimate.line_items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3">{item.part}</td>
                                        <td className="px-4 py-3">{item.action}</td>
                                        <td className="px-4 py-3 text-right">${item.cost}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-4 py-3" colSpan={2}>Total Estimate</td>
                                    <td className="px-4 py-3 text-right text-lg text-slate-900">
                                        ${estimate.summary.total.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sticky bottom-0 bg-slate-50 pt-4 pb-4">
                <Button variant="primary" disabled={!estimate} className="w-full shadow-lg shadow-blue-200">
                    Approve Estimate & Pay
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ClaimDetail;
