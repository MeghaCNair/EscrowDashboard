'use client';

import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import PageIntro from '../components/PageIntro';
import UpcomingPayments from '../components/UpcomingPayments';
import {
  calculateMetrics,
  segmentByRisk,
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

export default function PaymentsPage() {
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
  const upcomingPayments = getUpcomingPayments(data, 30, 25);
  const interactionCount = Object.values(interactionTypes).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <PageIntro
          kicker="Payment Operations"
          title="Coordinate tax and insurance disbursements"
          description={`Monitor ${upcomingPayments.length.toLocaleString('en-US')} upcoming escrow disbursements. Use reminders to keep borrowers aware of their next payment milestone.`}
          actions={
            <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200">
              Healthy coverage: {Math.round((segmentation.healthy.length / metrics.totalCustomers) * 100)}%
            </span>
          }
        />

        <div className="rounded-3xl border border-[#c8e6c9] bg-white/90 px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Looking for payment operations copilots?</h3>
              <p className="mt-1 text-sm text-gray-600">
                The AI Copilot Lab centralizes payment reminder and disbursement QA prototypes with detailed demos and rollout plans so your
                team can evaluate them alongside shortage and interaction copilots.
              </p>
            </div>
            <a
              href="/assistants"
              className="inline-flex items-center gap-2 rounded-full bg-[#2e7d32] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1b5e20]"
            >
              Open AI Copilot Lab
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        <UpcomingPayments customers={upcomingPayments} />
      </main>
    </div>
  );
}

