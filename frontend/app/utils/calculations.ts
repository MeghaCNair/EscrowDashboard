import { EscrowData, DashboardMetrics, RiskSegmentation } from '../types/escrow';

export function calculateMetrics(data: EscrowData[]): DashboardMetrics {
  const totalCustomers = data.length;
  const totalEscrowBalance = data.reduce((sum, d) => sum + d["Current Escrow Balance"], 0);
  const totalShortage = data.reduce((sum, d) => sum + d["Forecasted Escrow Shortage"], 0);
  
  // At-risk customers: those with significant shortage (> $2,000) - High and Medium risk
  const customersWithShortage = data.filter(d => d["Forecasted Escrow Shortage"] > 2000).length;
  const atRiskShortage = data
    .filter(d => d["Forecasted Escrow Shortage"] > 2000)
    .reduce((sum, d) => sum + d["Forecasted Escrow Shortage"], 0);
  const avgShortage = customersWithShortage > 0 
    ? atRiskShortage / customersWithShortage 
    : 0;

  return {
    totalCustomers,
    totalEscrowBalance,
    totalShortage,
    customersWithShortage,
    avgShortage,
  };
}

export function segmentByRisk(data: EscrowData[]): RiskSegmentation {
  return {
    highRisk: data.filter(d => d["Forecasted Escrow Shortage"] > 4000),
    mediumRisk: data.filter(d => d["Forecasted Escrow Shortage"] > 2000 && d["Forecasted Escrow Shortage"] <= 4000),
    lowRisk: data.filter(d => d["Forecasted Escrow Shortage"] > 0 && d["Forecasted Escrow Shortage"] <= 2000),
    healthy: data.filter(d => d["Forecasted Escrow Shortage"] === 0 && d["Forecasted Escrow Surplus"] >= 0),
  };
}

export function getCountyDistribution(data: EscrowData[]): Record<string, number> {
  return data.reduce((acc, d) => {
    acc[d.County] = (acc[d.County] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function getInteractionTypes(data: EscrowData[]): Record<string, number> {
  return data.reduce((acc, d) => {
    acc[d["Last Interaction Type"]] = (acc[d["Last Interaction Type"]] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function getTopShortages(data: EscrowData[], limit: number = 5): EscrowData[] {
  return [...data]
    .filter(d => d["Forecasted Escrow Shortage"] > 0)
    .sort((a, b) => b["Forecasted Escrow Shortage"] - a["Forecasted Escrow Shortage"])
    .slice(0, limit);
}

export function getUpcomingPayments(data: EscrowData[], days: number = 30, limit: number = 10): EscrowData[] {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  return data
    .filter(d => {
      const taxDate = new Date(d["Next Tax Pay Date"]);
      const insDate = new Date(d["Next Insurance Pay Date"]);
      return (taxDate >= today && taxDate <= futureDate) || 
             (insDate >= today && insDate <= futureDate);
    })
    .slice(0, limit);
}

