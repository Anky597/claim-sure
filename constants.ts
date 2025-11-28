import { Claim, ClaimStatus } from './types';

export const mockClaims: Claim[] = [
  {
    id: "CLM-8821",
    customer: "Alex Doe",
    status: ClaimStatus.RiskAlert,
    riskScore: 85, // High risk
    timePending: "5h 20m",
    vehicle: "2020 Honda Civic",
    summary: "Synthetic Image Detected in evidence upload.",
    estimate: 0,
    dateSubmitted: "2023-10-25"
  },
  {
    id: "CLM-9942",
    customer: "Sarah Smith",
    status: ClaimStatus.ReadyForApproval,
    riskScore: 12, // Low risk
    timePending: "1h 05m",
    vehicle: "2022 Tesla Model 3",
    summary: "Bumper dent consistent with narrative.",
    estimate: 1250,
    dateSubmitted: "2023-10-26"
  },
  {
    id: "CLM-7731",
    customer: "Michael Chen",
    status: ClaimStatus.Analyzing,
    riskScore: 45,
    timePending: "0h 15m",
    vehicle: "2019 Ford F-150",
    summary: "Analyzing heavy front-end damage.",
    estimate: 3400,
    dateSubmitted: "2023-10-27"
  },
  {
    id: "CLM-6619",
    customer: "Emily Johnson",
    status: ClaimStatus.Approved,
    riskScore: 5,
    timePending: "Closed",
    vehicle: "2021 Toyota RAV4",
    summary: "Windshield replacement approved automatically.",
    estimate: 450,
    dateSubmitted: "2023-10-20"
  }
];

export const CURRENT_CUSTOMER_USER = {
  name: "Alex",
  role: "customer"
};