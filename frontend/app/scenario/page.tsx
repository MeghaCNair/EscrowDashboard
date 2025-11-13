'use client';

import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import PageIntro from '../components/PageIntro';
import ScenarioModeler from '../components/ScenarioModeler';
import { useEscrowData } from '../hooks/useEscrowData';
import AIChatWidget from '../components/AIChatWidget';

const NAVIGATION_LINKS = {
  overview: '/overview',
  shortages: '/shortages',
  payments: '/payments',
  interactions: '/interactions',
  scenario: '/scenario',
} as const;

export default function ScenarioPage() {
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

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <PageIntro
          kicker="Scenario Planning"
          title="Model how tax and insurance changes affect escrow balances"
          description="Experiment with macro adjustments, see how shortages shift, and prioritise where proactive outreach or contribution changes will have the biggest impact."
        />

        <ScenarioModeler records={data} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIChatWidget
            title="Scenario design copilot"
            description="Translate plain-language what-if questions into model parameters and explain sensitivity across key KPIs."
            ctaLabel="Plan a market shock test"
            tone="info"
          />
          <AIChatWidget
            title="Contribution advisor"
            description="Recommends escrow contribution adjustments per borrower cohort to keep balances compliant under your selected scenario."
            ctaLabel="Suggest contribution changes"
            tone="success"
          />
        </div>
      </main>
    </div>
  );
}

