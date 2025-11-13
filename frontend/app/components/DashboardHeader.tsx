'use client';

import Link from 'next/link';
import { DashboardMetrics, RiskSegmentation } from '../types/escrow';

export type DashboardSection = 'overview' | 'shortages' | 'payments' | 'interactions';

interface DashboardHeaderProps {
  metrics: DashboardMetrics;
  segmentation: RiskSegmentation;
  upcomingCount: number;
  interactionCount: number;
  navigation: Record<DashboardSection, string>;
  currentSection?: DashboardSection;
}

export default function DashboardHeader({
  metrics,
  segmentation,
  upcomingCount,
  interactionCount,
  navigation,
  currentSection = 'overview',
}: DashboardHeaderProps) {
  const highRiskCustomers = segmentation.highRisk.length;
  const mediumRiskCustomers = segmentation.mediumRisk.length;
  const totalRiskCustomers = highRiskCustomers + mediumRiskCustomers;
  const healthyCustomers = segmentation.healthy.length;
  const healthyPercentage = metrics.totalCustomers
    ? Math.round((healthyCustomers / metrics.totalCustomers) * 100)
    : 0;

  return (
    <section className="rounded-[28px] bg-gradient-to-br from-white via-[#fffbfc] to-[#f3f6fb] border border-white/70 shadow-[0_24px_65px_rgba(15,23,42,0.08)] overflow-hidden mb-8">
      <div className="relative">
        <div className="absolute inset-0 opacity-70">
          <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 100C0 100 120 20 250 60C380 100 420 200 540 190C660 180 680 80 800 100"
              stroke="url(#paint0_linear)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="120" cy="140" r="6" fill="#d32f2f" fillOpacity="0.2" />
            <circle cx="540" cy="90" r="8" fill="#1565c0" fillOpacity="0.15" />
            <circle cx="700" cy="210" r="5" fill="#d32f2f" fillOpacity="0.1" />
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="100" x2="800" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d32f2f" stopOpacity="0.35" />
                <stop offset="0.5" stopColor="#ff7043" stopOpacity="0.25" />
                <stop offset="1" stopColor="#1976d2" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white shadow-sm text-sm text-[#d32f2f] font-medium mb-4">
                <span className="h-2 w-2 rounded-full bg-[#d32f2f]"></span>
                Real-time Escrow Intelligence
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
                Powering proactive decisions for {metrics.totalCustomers.toLocaleString('en-US')} escrow accounts
              </h2>
              <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-xl">
                Prioritize outreach, monitor shortages, and stay ahead of customer expectations with Rocket Companies’ agent-first dashboard.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 min-w-[260px]">
              <div className="rounded-2xl border border-[#f6d5d5] bg-gradient-to-br from-[#ffdad6] via-[#ffecec] to-white px-5 py-4 shadow-md">
                <p className="text-xs uppercase tracking-wide text-[#c62828] mb-1">High Priority</p>
                <p className="text-2xl font-semibold text-[#c62828] flex items-center gap-1.5">
                  {highRiskCustomers.toLocaleString()}
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#d32f2f]/20 text-[#c62828] text-xs font-semibold">
                    !
                  </span>
                </p>
                <p className="text-sm text-[#c62828] font-medium">Shortage &gt; $4K — escalate today</p>
              </div>
              <div className="rounded-2xl border border-[#c8e6c9] bg-gradient-to-br from-[#dcedc8] via-[#eff7eb] to-white px-5 py-4 shadow-md">
                <p className="text-xs uppercase tracking-wide text-[#2e7d32] mb-1">Healthy Accounts</p>
                <p className="text-2xl font-semibold text-[#2e7d32] flex items-center gap-1.5">
                  {healthyCustomers.toLocaleString()}
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#2e7d32]/15 text-[#2e7d32] text-xs font-semibold">
                    ✔
                  </span>
                </p>
                <p className="text-sm text-[#2e7d32] font-medium">On track & surplus ready</p>
              </div>
              <div className="glass-panel px-5 py-4 col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Healthy Coverage</p>
                    <p className="text-xl font-semibold text-slate-900">{healthyPercentage}%</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#ffebee] flex items-center justify-center text-[#d32f2f] font-semibold">
                    SLA
                  </div>
                </div>
                <div className="mt-3 w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#d32f2f]"
                    style={{ width: `${Math.min((totalRiskCustomers / metrics.totalCustomers) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {totalRiskCustomers.toLocaleString('en-US')} accounts require attention in the next cycle.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Active Accounts"
              value={metrics.totalCustomers.toLocaleString('en-US')}
              helper="View performance overview"
              badge="+12% QoQ"
              href={navigation.overview}
              isActive={currentSection === 'overview'}
            />
            <SummaryCard
              label="At-Risk Accounts"
              value={totalRiskCustomers.toLocaleString('en-US')}
              helper="See shortage breakdown"
              tone="critical"
              href={navigation.shortages}
              isActive={currentSection === 'shortages'}
            />
            <SummaryCard
              label="Upcoming Payments"
              value={upcomingCount.toLocaleString('en-US')}
              helper="Review disbursement schedule"
              tone="warning"
              href={navigation.payments}
              isActive={currentSection === 'payments'}
            />
            <SummaryCard
              label="Recent Interactions"
              value={interactionCount.toLocaleString('en-US')}
              helper="Analyze communication mix"
              tone="info"
              href={navigation.interactions}
              isActive={currentSection === 'interactions'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  helper: string;
  badge?: string;
  tone?: 'neutral' | 'critical' | 'warning' | 'info';
  href: string;
  isActive?: boolean;
}

function SummaryCard({ label, value, helper, badge, tone = 'neutral', href, isActive = false }: SummaryCardProps) {
  const toneStyles: Record<
    typeof tone,
    { border: string; iconBg: string; valueColor: string; helperColor: string; activeGlow: string; background: string }
  > = {
    neutral: {
      border: 'border-gray-200',
      iconBg: 'bg-slate-200 text-slate-600',
      valueColor: 'text-slate-900',
      helperColor: 'text-slate-500',
      activeGlow: 'shadow-[0_0_0_3px_rgba(59,130,246,0.25)]',
      background: 'bg-gradient-to-br from-[#f4f6f9] via-white to-white',
    },
    critical: {
      border: 'border-[#f6d5d5]',
      iconBg: 'bg-[#ffd0d0] via-[#ffe1e1] to-white',
      valueColor: 'text-[#c62828]',
      helperColor: 'text-[#d32f2f]',
      activeGlow: 'shadow-[0_0_0_3px_rgba(211,47,47,0.2)]',
      background: 'bg-gradient-to-br from-[#ffd0d0] via-[#ffe1e1] to-white',
    },
    warning: {
      border: 'border-[#ffe8cc]',
      iconBg: 'bg-[#ffe6b3] text-[#f57f17]',
      valueColor: 'text-[#ef6c00]',
      helperColor: 'text-[#f57f17]',
      activeGlow: 'shadow-[0_0_0_3px_rgba(251,140,0,0.2)]',
      background: 'bg-gradient-to-br from-[#ffe8b0] via-[#fff3d1] to-white',
    },
    info: {
      border: 'border-[#d7e6fb]',
      iconBg: 'bg-[#cfe0fc] text-[#1565c0]',
      valueColor: 'text-[#0d47a1]',
      helperColor: 'text-[#1565c0]',
      activeGlow: 'shadow-[0_0_0_3px_rgba(21,101,192,0.2)]',
      background: 'bg-gradient-to-br from-[#cfe0fc] via-[#e1edff] to-white',
    },
  };

  const styles = toneStyles[tone];

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`group w-full rounded-2xl border ${styles.border} ${styles.background} px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(15,23,42,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d32f2f]/40 ${
        isActive ? styles.activeGlow : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className={`mt-2 text-2xl font-semibold ${styles.valueColor}`}>{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-inner ${styles.iconBg}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7 7l7-7-7-7" />
          </svg>
        </div>
      </div>
      <p className={`mt-3 text-sm font-medium ${styles.helperColor}`}>{helper}</p>
      {badge && (
        <span className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#d32f2f] to-[#f06292]"></span>
          {badge}
        </span>
      )}
    </Link>
  );
}
