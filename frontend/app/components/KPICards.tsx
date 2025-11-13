import { DashboardMetrics } from '../types/escrow';
import KPICard from './KPICard';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export default function KPICards({ metrics }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard
        title="Total Customers"
        value={metrics.totalCustomers}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        iconBgColor="bg-gradient-to-br from-blue-100 via-white to-blue-50"
        iconColor="text-blue-600"
        cardBgColor="bg-gradient-to-br from-white via-blue-50/60 to-white"
        borderColor="border-blue-100"
        titleColor="text-blue-700"
        valueColor="text-blue-700"
      />
      
      <KPICard
        title="Total Escrow Balance"
        value={`$${(metrics.totalEscrowBalance / 1000).toFixed(0)}K`}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        iconBgColor="bg-gradient-to-br from-green-100 via-white to-green-50"
        iconColor="text-green-700"
        cardBgColor="bg-gradient-to-br from-white via-green-50/70 to-white"
        borderColor="border-green-100"
        titleColor="text-green-700"
        valueColor="text-green-700"
      />
      
      <KPICard
        title="At-Risk Customers"
        value={metrics.customersWithShortage}
        subtitle={`Avg: $${metrics.avgShortage.toFixed(0)}`}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        iconBgColor="bg-gradient-to-br from-red-100 via-white to-red-50"
        iconColor="text-red-700"
        cardBgColor="bg-gradient-to-br from-white via-red-50/70 to-white"
        borderColor="border-red-100"
        titleColor="text-red-700"
        valueColor="text-red-700"
      />
      
      <KPICard
        title="Total Shortage"
        value={`$${(metrics.totalShortage / 1000).toFixed(0)}K`}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        iconBgColor="bg-gradient-to-br from-orange-100 via-white to-orange-50"
        iconColor="text-orange-700"
        cardBgColor="bg-gradient-to-br from-white via-orange-50/70 to-white"
        borderColor="border-orange-100"
        titleColor="text-orange-700"
        valueColor="text-orange-700"
      />
    </div>
  );
}

