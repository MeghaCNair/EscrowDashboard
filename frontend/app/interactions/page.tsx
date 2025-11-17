'use client';

import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import PageIntro from '../components/PageIntro';
import InteractionTypes from '../components/InteractionTypes';
import CountyDistribution from '../components/CountyDistribution';
import CustomerSegmentation from '../components/CustomerSegmentation';
import {
  calculateMetrics,
  segmentByRisk,
  getCountyDistribution,
  getInteractionTypes,
  getUpcomingPayments,
} from '../utils/calculations';
import { useEscrowData } from '../hooks/useEscrowData';

const NAVIGATION_LINKS = {
  overview: '/overview',
  shortages: '/shortages',
  payments: '/payments',
  interactions: '/interactions',
} as const;

export default function InteractionsPage() {
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
  const countyCounts = getCountyDistribution(data);
  const interactionTypes = getInteractionTypes(data);
  const interactionCount = Object.values(interactionTypes).reduce((sum, val) => sum + val, 0);
  const upcomingPayments = getUpcomingPayments(data, 30, 10);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <PageIntro
          kicker="Servicing Insights"
          title="Understand how borrowers are reaching out"
          description={`Track ${interactionCount.toLocaleString('en-US')} borrower interactions and where they originated. Use this workspace to export daily digests for leadership and servicing teams.`}
          actions={
            <a
              href="/interactions"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#e3f2fd] text-[#1565c0] text-sm font-semibold hover:bg-[#bbdefb] transition-colors shadow-sm"
            >
              Export interaction log
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          }
        />

        <div className="rounded-3xl border border-[#d7e6fb] bg-white/90 px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Preview AI copilots for interaction teams</h3>
              <p className="mt-1 text-sm text-gray-600">
                The AI Copilot Lab houses conversation summarizers, coaching copilots, and leadership digests with detailed demos so your
                interaction leads can experiment in one place.
              </p>
            </div>
            <a
              href="/assistants"
              className="inline-flex items-center gap-2 rounded-full bg-[#1565c0] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0d47a1]"
            >
              Open AI Copilot Lab
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractionTypes interactionTypes={interactionTypes} totalCustomers={metrics.totalCustomers} />
          <CountyDistribution countyCounts={countyCounts} totalCustomers={metrics.totalCustomers} />
        </div>

        <CustomerSegmentation segmentation={segmentation} />
      </main>
    </div>
  );
}

