'use client';

import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import PageIntro from '../components/PageIntro';
import ScenarioModeler from '../components/ScenarioModeler';
import { useEscrowData } from '../hooks/useEscrowData';

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

        <div className="rounded-3xl border border-[#d1c4e9] bg-white/90 px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Prototype copilots for scenario planning live in one hub</h3>
              <p className="mt-1 text-sm text-gray-600">
                Head to the AI Copilot Lab to explore scenario design, contribution advisor, and other forward-looking copilots alongside
                shortage, payments, and interaction experiences.
              </p>
            </div>
            <a
              href="/assistants"
              className="inline-flex items-center gap-2 rounded-full bg-[#7e57c2] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#5e35b1]"
            >
              Open AI Copilot Lab
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

