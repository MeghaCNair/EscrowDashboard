export interface EscrowData {
  "Customer Name": string;
  "Contact": string;
  "Loan Number": number;
  "Total Loan Amount": number;
  "Current Balance": number;
  "Current Escrow Balance": number;
  "Prev Tax": number;
  "Prev Insurance": number;
  "Forecasted Tax": number;
  "Forecasted Insurance": number;
  "Last Tax Paid Date": string;
  "Last Insurance Paid Date": string;
  "Next Tax Pay Date": string;
  "Next Insurance Pay Date": string;
  "Forecasted Escrow Surplus": number;
  "Forecasted Escrow Shortage": number;
  "Last Interaction Date": string;
  "Last Interaction Type": string;
  "Last Interaction Summary": string;
  "County": string;
  "Property Address": string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalEscrowBalance: number;
  totalShortage: number;
  customersWithShortage: number;
  avgShortage: number;
}

export interface RiskSegmentation {
  highRisk: EscrowData[];
  mediumRisk: EscrowData[];
  lowRisk: EscrowData[];
  healthy: EscrowData[];
}

