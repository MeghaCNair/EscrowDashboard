'use client';

import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import PageIntro from '../components/PageIntro';
import CustomerSegmentation from '../components/CustomerSegmentation';
import CountyDistribution from '../components/CountyDistribution';
import {
  calculateMetrics,
  segmentByRisk,
  getInteractionTypes,
  getUpcomingPayments,
} from '../utils/calculations';
import { useEscrowData } from '../hooks/useEscrowData';
import ShortageTable from '../components/ShortageTable';
import { EscrowData } from '../types/escrow';
import AIChatWidget from '../components/AIChatWidget';

function computeRiskByCounty(segmentation: ReturnType<typeof segmentByRisk>) {
  const counties: Record<string, { high: number; medium: number; low: number }> = {};

  const tally = (records: EscrowData[], key: 'high' | 'medium' | 'low') => {
    records.forEach((record) => {
      if (!counties[record.County]) {
        counties[record.County] = { high: 0, medium: 0, low: 0 };
      }
      counties[record.County][key] += 1;
    });
  };

  tally(segmentation.highRisk, 'high');
  tally(segmentation.mediumRisk, 'medium');
  tally(segmentation.lowRisk, 'low');

  return counties;
}

const NAVIGATION_LINKS = {
  overview: '/overview',
  shortages: '/shortages',
  payments: '/payments',
  interactions: '/interactions',
} as const;

export default function ShortagesPage() {
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
  const shortageQueue = data.filter((record) => record['Forecasted Escrow Shortage'] > 0);

  const getCountyDistribution = (data: any[]) => {
    const countyCounts: { [key: string]: number } = {};
    data.forEach(record => {
      const county = record['County'];
      if (county) {
        countyCounts[county] = (countyCounts[county] || 0) + 1;
      }
    });
    return countyCounts;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <PageIntro
          kicker="Shortage Operations"
          title="Prioritise borrowers trending into escrow shortages"
          description={`Review ${shortageQueue.length.toLocaleString('en-US')} customers projected to fall below required balances. Use the queue to triage outreach and keep escrow accounts compliant.`}
          actions={
            <>
              <a
                href="/interactions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d32f2f] text-white text-sm font-semibold shadow-md hover:bg-[#b71c1c] transition-colors"
              >
                Share queue with servicing
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200">
                High risk: {segmentation.highRisk.length.toLocaleString('en-US')} • Medium: {segmentation.mediumRisk.length.toLocaleString('en-US')}
              </span>
            </>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CustomerSegmentation segmentation={segmentation} />
          </div>
          <CountyDistribution
            countyCounts={getCountyDistribution(data)}
            totalCustomers={metrics.totalCustomers}
            riskBreakdown={computeRiskByCounty(segmentation)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIChatWidget
            title="AI shortage negotiator"
            description="Simulates repayment plans, drafts hardship responses, and recommends tailored contact strategies per borrower risk."
            ctaLabel="Draft an outreach script"
            tone="critical"
          />
          <AIChatWidget
            title="County risk intelligence bot"
            description="Answers questions about county-level drivers, regulatory requirements, and signals that impact escrow cushions."
            ctaLabel="Ask about county trends"
            tone="info"
          />
        </div>

        <ShortageTable records={shortageQueue} />
      </main>
    </div>
  );
}

