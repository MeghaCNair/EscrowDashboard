'use client';

import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardHeader from '../components/DashboardHeader';
import KPICards from '../components/KPICards';
import {
  calculateMetrics,
  segmentByRisk,
  getInteractionTypes,
  getUpcomingPayments,
} from '../utils/calculations';
import { useEscrowData } from '../hooks/useEscrowData';
import Link from 'next/link';

const NAVIGATION_LINKS = {
  overview: '/overview',
  shortages: '/shortages',
  payments: '/payments',
  interactions: '/interactions',
} as const;

export default function OverviewPage() {
  const { data, loading, error } = useEscrowData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafc] text-gray-600">
        <p className="text-lg font-medium">Unable to load escrow data.</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );
  }

  const metrics = calculateMetrics(data);
  const segmentation = segmentByRisk(data);
  const interactionTypes = getInteractionTypes(data);
  const upcomingPayments = getUpcomingPayments(data, 30, 10);
  const interactionCount = Object.values(interactionTypes).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <DashboardHeader
          metrics={metrics}
          segmentation={segmentation}
          upcomingCount={upcomingPayments.length}
          interactionCount={interactionCount}
          navigation={NAVIGATION_LINKS}
          currentSection="overview"
        />

        <section>
          <KPICards metrics={metrics} />
        </section>

        <section className="rounded-3xl border border-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] bg-white/85 px-8 py-10 space-y-8">
          <div className="max-w-2xl space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">What would you like to do next?</h3>
            <p className="text-base text-gray-600">
              Rocket escrow agents are monitoring {metrics.totalCustomers.toLocaleString()} accounts with{' '}
              {interactionCount.toLocaleString()} recent touchpoints. Jump into an action workspace or run a quick playbook
              right from here.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              title="Notify high-risk borrowers"
              description={`${segmentation.highRisk.length.toLocaleString()} accounts exceed shortage thresholds. Trigger templated outreach or assign follow-ups.`}
              cta="Open shortage queue"
              href="/shortages"
              tone="critical"
            />
            <FeatureCard
              title="Schedule payment reminders"
              description={`Queue reminders for ${upcomingPayments.length.toLocaleString()} upcoming tax and insurance disbursements.`}
              cta="Go to payments"
              href="/payments"
              tone="warning"
            />
            <FeatureCard
              title="Share today’s insights"
              description={`Summaries and exports for ${interactionCount.toLocaleString()} recent interactions with servicing teams.`}
              cta="Export interaction log"
              href="/interactions"
              tone="info"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  cta: string;
  href: string;
  tone?: 'critical' | 'warning' | 'info' | 'neutral';
}

function FeatureCard({ title, description, cta, href, tone = 'neutral' }: FeatureCardProps) {
  const toneStyles: Record<
    typeof tone,
    { background: string; badge: string; button: string; buttonHover: string }
  > = {
    critical: {
      background: 'from-[#ffebee] via-white to-white',
      badge: 'bg-[#d32f2f]/15 text-[#c62828]',
      button: 'bg-[#d32f2f] text-white',
      buttonHover: 'hover:bg-[#b71c1c]',
    },
    warning: {
      background: 'from-[#fff3e0] via-white to-white',
      badge: 'bg-[#fb8c00]/15 text-[#ef6c00]',
      button: 'bg-[#fb8c00] text-white',
      buttonHover: 'hover:bg-[#ef6c00]',
    },
    info: {
      background: 'from-[#e3f2fd] via-white to-white',
      badge: 'bg-[#1565c0]/15 text-[#0d47a1]',
      button: 'bg-[#1565c0] text-white',
      buttonHover: 'hover:bg-[#0d47a1]',
    },
    neutral: {
      background: 'from-[#f5f7fb] via-white to-white',
      badge: 'bg-slate-200 text-slate-700',
      button: 'bg-slate-900 text-white',
      buttonHover: 'hover:bg-slate-800',
    },
  };

  const styles = toneStyles[tone];

  return (
    <div className={`rounded-2xl border border-white bg-gradient-to-br ${styles.background} p-6 shadow-sm`}>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles.badge}`}>
        Recommended
      </span>
      <h4 className="mt-4 text-lg font-semibold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
      <Link
        href={href}
        className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${styles.button} ${styles.buttonHover}`}
      >
        {cta}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

