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
import AIChatWidget from '../components/AIChatWidget';

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIChatWidget
            title="Payment reminder co-pilot"
            description="Drafts borrower-friendly reminder scripts, recommends timing, and adapts tone based on historical responsiveness."
            ctaLabel="Plan my reminder sequence"
            tone="success"
          />
          <AIChatWidget
            title="Disbursement QA assistant"
            description="Cross-checks escrow balances against scheduled disbursements and flags accounts at risk of shortfall before funding."
            ctaLabel="Run a pre-disbursement check"
            tone="info"
          />
        </div>

        <UpcomingPayments customers={upcomingPayments} />
      </main>
    </div>
  );
}

