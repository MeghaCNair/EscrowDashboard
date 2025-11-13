'use client';

import { useState } from 'react';
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
import AIChatWidget from '../components/AIChatWidget';

const NAVIGATION_LINKS = {
  overview: '/overview',
  shortages: '/shortages',
  payments: '/payments',
  interactions: '/interactions',
} as const;

type PanelKey = 'highlights' | 'playbooks' | 'assistants';

const PANEL_ITEMS: Array<{ id: PanelKey; label: string; helper: string }> = [
  {
    id: 'highlights',
    label: 'Highlights',
    helper: 'Key KPIs and segmentation snapshot',
  },
  {
    id: 'playbooks',
    label: 'Playbooks',
    helper: 'Jump into actions and workflow shortcuts',
  },
  {
    id: 'assistants',
    label: 'AI copilots',
    helper: 'Future conversational support modules',
  },
];

export default function OverviewPage() {
  const { data, loading, error } = useEscrowData();
  const [activePanel, setActivePanel] = useState<PanelKey>('highlights');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const handleSelectPanel = (panel: PanelKey) => {
    setActivePanel(panel);
    setMobileNavOpen(false);
  };

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'highlights':
        return (
          <div className="space-y-5">
            <div className="rounded-3xl border border-white bg-white/90 px-5 py-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Escrow snapshot</h3>
              <p className="mt-1 text-sm text-gray-600">
                {metrics.totalCustomers.toLocaleString('en-US')} customers under management, with{' '}
                {segmentation.highRisk.length.toLocaleString('en-US')} high-risk accounts flagged for follow-up.
              </p>
            </div>
            <KPICards metrics={metrics} />
          </div>
        );
      case 'playbooks':
        return (
          <div className="space-y-5">
            <div className="rounded-3xl border border-white bg-white/90 px-5 py-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Workflow shortcuts</h3>
              <p className="mt-1 text-sm text-gray-600">
                Pivot into shortage triage, payment operations, or interaction summaries directly from the landing view.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <FeatureCard
                title="Notify high-risk borrowers"
                description={`${segmentation.highRisk.length.toLocaleString('en-US')} accounts exceed shortage thresholds. Trigger templated outreach or assign follow-ups.`}
                cta="Open shortage queue"
                href="/shortages"
                tone="critical"
              />
              <FeatureCard
                title="Schedule payment reminders"
                description={`Queue reminders for ${upcomingPayments.length.toLocaleString('en-US')} upcoming disbursements in a few clicks.`}
                cta="Go to payments"
                href="/payments"
                tone="warning"
              />
              <FeatureCard
                title="Share today’s insights"
                description={`Package ${interactionCount.toLocaleString('en-US')} recent interactions into a leadership-ready recap.`}
                cta="Export interaction log"
                href="/interactions"
                tone="info"
              />
            </div>
          </div>
        );
      case 'assistants':
        return (
          <div className="space-y-5">
            <div className="rounded-3xl border border-white bg-white/90 px-5 py-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">AI copilots on deck</h3>
              <p className="mt-1 text-sm text-gray-600">
                Reserve space for conversational agents once LLM integrations are ready. Capture ideas now so implementation is
                plug-and-play later.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AIChatWidget
                title="Escrow shortage triage assistant"
                description="Guides agents through borrower outreach sequences, drafts personalized messages, and surfaces risk drivers instantly."
                ctaLabel="Chat about a borrower portfolio"
                tone="critical"
              />
              <AIChatWidget
                title="Executive briefing copilot"
                description={`Summarizes KPIs, builds leadership-ready talking points, and flags emerging trends across ${interactionCount.toLocaleString('en-US')} recent interactions.`}
                ctaLabel="Draft my daily digest"
                tone="info"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 space-y-8">
        <DashboardHeader
          metrics={metrics}
          segmentation={segmentation}
          upcomingCount={upcomingPayments.length}
          interactionCount={interactionCount}
          navigation={NAVIGATION_LINKS}
          currentSection="overview"
        />

        <section className="rounded-3xl border border-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] bg-white/90 px-6 sm:px-8 py-7">
          <div className="lg:hidden flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Workspace switcher</h3>
              <p className="text-xs text-gray-500">Tap the menu to jump between highlights, playbooks, or future copilots.</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:border-[#d32f2f]/40 hover:text-[#d32f2f] transition-colors"
              aria-label="Toggle overview panels"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {mobileNavOpen ? (
            <div className="mt-4 space-y-2 lg:hidden">
              {PANEL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPanel(item.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    activePanel === item.id
                      ? 'border-[#d32f2f]/40 bg-[#ffebee]/70 text-[#b71c1c]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#d32f2f]/30 hover:text-[#d32f2f]'
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs text-gray-500">{item.helper}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="lg:hidden mt-6">{renderPanelContent()}</div>

          <div className="hidden lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
            <aside className="flex flex-col gap-2">
              {PANEL_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPanel(item.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    activePanel === item.id
                      ? 'border-[#d32f2f]/50 bg-[#ffebee]/80 text-[#b71c1c] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#d32f2f]/30 hover:text-[#d32f2f]'
                  }`}
                >
                  <span className="text-sm font-semibold text-current">{item.label}</span>
                  <span className="mt-1 block text-xs text-gray-500">{item.helper}</span>
                </button>
              ))}
            </aside>
            <div className="lg:pl-2">{renderPanelContent()}</div>
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

