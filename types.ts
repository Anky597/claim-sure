export enum ClaimStatus {
  Submitted = 'Submitted',
  Analyzing = 'Analyzing',
  Reviewing = 'Reviewing',
  Approved = 'Approved',
  RiskAlert = 'Risk Alert',
  ReadyForApproval = 'Ready for Approval',
  Closed = 'Closed'
}

export interface Claim {
  id: string;
  customer: string;
  status: ClaimStatus | string;
  riskScore: number; // 0-100
  timePending: string;
  vehicle: string;
  summary: string;
  estimate: number;
  dateSubmitted?: string;
}

export interface User {
  name: string;
  role: 'customer' | 'adjuster';
}

// Backend Response Types

export interface UploadResponse {
  status: string;
  file_id: string;
  case_id: string;
  message: string;
}

export interface AnalysisRequest {
  user_submission: Record<string, any>;
  location: string;
  date?: string;
}

export interface AnalysisResult {
  reasoning_behind_score: string;
  score: number;
  damage_analysis?: string[];
}

export interface EstimateItem {
  part_name: string;
  part_number: string;
  price: number;
  availability: string;
}

export interface EstimateSummary {
  subtotal: number;
  tax: number;
  total: number;
}

export interface EstimateResponse {
  estimate_id: string;
  line_items: EstimateItem[];
  labor: {
    hours: number;
    rate: number;
    total: number;
  };
  summary: EstimateSummary;
}

export interface HistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
}

export interface ClientHistoryResponse {
  accident_history: any[]; // The backend returns a complex object, we might need to map it or define it fully if used
  risk_score: number;
}
