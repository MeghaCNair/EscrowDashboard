'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

type ExtensionId = 'batch' | 'exception';

interface ExtensionPrototype {
  kicker: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string; helper?: string }>;
  highlights: Array<{ title: string; body: string }>;
  steps: string[];
}

interface BackOfficeExtension {
  id: ExtensionId;
  title: string;
  summary: string;
  impact: string;
  actions: string[];
  prototype: ExtensionPrototype;
}

const formatNumber = (value: number) => value.toLocaleString('en-US');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);

type DemoResult = {
  stats: Array<{ label: string; value: string; helper?: string }>;
  insights: string[];
};

type DemoConfig = {
  sliders: Array<{
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    suffix?: string;
    helper?: string;
    formatter?: (value: number) => string;
  }>;
};

type DemoInputs = Record<ExtensionId, Record<string, number>>;

export default function ScenarioPage() {
  const { data, loading, error } = useEscrowData();

  const backOfficeExtensions: BackOfficeExtension[] = useMemo(
    () => [
      {
        id: 'batch',
        title: 'Batch payment stress test',
        summary:
          'Shift tax or insurance due dates forward or back, toggle county grace periods, and immediately flag borrowers that tip into shortage or delinquency under the new calendar.',
        impact: 'Lets back-office teams rehearse policy changes without surprising agents or customers.',
        actions: ['Bulk-edit due date scenarios', 'Estimate surge workload for payment ops', 'Export exception queues for follow-up'],
        prototype: {
          kicker: 'Prototype walkthrough',
          title: 'Batch payment stress test',
          description:
            'Drag a slider to shift billing calendars, layer grace-period overrides, and surface borrowers who fall into shortage or delinquency.',
          stats: [
            { label: 'Calendar shift', value: '+21 days', helper: 'Insurance billing move' },
            { label: 'New shortage cases', value: '63', helper: 'Require proactive outreach' },
            { label: 'Delinquency risk', value: '+12%', helper: 'If no intervention' },
          ],
          highlights: [
            {
              title: 'Calendar sandbox',
              body: 'Shift tax and insurance due dates by days or weeks with immediate shortage projections.',
            },
            {
              title: 'Exception panel',
              body: 'Filter borrowers by new risk status, county, and required follow-up team.',
            },
            {
              title: 'Ops readiness',
              body: 'Estimate staffing hours and escalation tickets triggered by the simulated policy.',
            },
          ],
          steps: [
            'Adjust due date and grace-period sliders.',
            'Review shortage and delinquency projections with staffing estimate.',
            'Export impacted borrower roster to payment ops.',
          ],
        },
      },
      {
        id: 'exception',
        title: 'Exception resolution lab',
        summary:
          'Replay historic shortage exceptions, tweak policy rules (fee waivers, repayment windows, escalation timing) and measure the effect on resolution time and staff workload.',
        impact: 'Supports continuous improvement across loss-mit, audit, and compliance teams.',
        actions: ['Test alternate remediation paths', 'Track resolution speed deltas', 'Document policy recommendations'],
        prototype: {
          kicker: 'Prototype walkthrough',
          title: 'Exception resolution lab',
          description:
            'Run A/B policy experiments on historic exceptions, comparing fee waivers, repayment windows, and escalation timing to see speed-to-resolution impact.',
          stats: [
            { label: 'Scenarios compared', value: '3', helper: 'Baseline vs two variants' },
            { label: 'Resolution time delta', value: '-18%', helper: 'When waiving late fees' },
            { label: 'Agent hours saved', value: '72 hrs', helper: 'Per 100 exceptions' },
          ],
          highlights: [
            {
              title: 'Policy designer',
              body: 'Modify fees, repayment windows, and escalation triggers with scenario comparisons.',
            },
            {
              title: 'Outcome analytics',
              body: 'Charts resolution time, borrower satisfaction, and compliance hits per variant.',
            },
            {
              title: 'Playbook export',
              body: 'Document recommended policy with supporting metrics for governance review.',
            },
          ],
          steps: [
            'Choose a historical exception cohort.',
            'Adjust policy levers and review comparative outcomes.',
            'Export recommended playbook with metrics and next steps.',
          ],
        },
      },
    ],
    [],
  );

  const [activePrototype, setActivePrototype] = useState<ExtensionId | null>(null);
  const demoSectionRef = useRef<HTMLDivElement | null>(null);
  const [demoInputs, setDemoInputs] = useState<DemoInputs>({
    batch: { shiftDays: 14, graceDays: 5 },
    exception: { feeWaiver: 35, repaymentMonths: 6 },
  });

  useEffect(() => {
    if (activePrototype && demoSectionRef.current) {
      demoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activePrototype]);

  const datasetMetrics = useMemo(() => {
    const counties = new Set<string>();
    let totalShortage = 0;
    let totalEscrowBalance = 0;
    let highRiskCount = 0;
    let totalHighRiskShortage = 0;
    let upcomingPayments = 0;
    let totalUpcomingAmount = 0;

    const today = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 30);

    data.forEach((record) => {
      const shortage = record['Forecasted Escrow Shortage'];
      const balance = record['Current Escrow Balance'];
      totalShortage += shortage;
      totalEscrowBalance += balance;
      if (shortage > 2000) {
        highRiskCount += 1;
        totalHighRiskShortage += shortage;
      }
      counties.add(record.County);

      const taxDate = new Date(record['Next Tax Pay Date']);
      if (!Number.isNaN(taxDate.getTime()) && taxDate >= today && taxDate <= future) {
        upcomingPayments += 1;
        totalUpcomingAmount += record['Forecasted Tax'];
      }
      const insDate = new Date(record['Next Insurance Pay Date']);
      if (!Number.isNaN(insDate.getTime()) && insDate >= today && insDate <= future) {
        upcomingPayments += 1;
        totalUpcomingAmount += record['Forecasted Insurance'];
      }
    });

    return {
      totalCustomers: data.length,
      totalShortage,
      totalEscrowBalance,
      highRiskCount,
      avgShortageHighRisk: highRiskCount ? totalHighRiskShortage / highRiskCount : 0,
      upcomingPayments,
      avgUpcomingPayment: upcomingPayments ? totalUpcomingAmount / upcomingPayments : 0,
      countyCount: counties.size,
    };
  }, [data]);

  const demoConfigs: Record<ExtensionId, DemoConfig> = useMemo(
    () => ({
      batch: {
        sliders: [
          {
            key: 'shiftDays',
            label: 'Billing calendar shift',
            min: -30,
            max: 30,
            step: 1,
            suffix: ' days',
            helper: 'Move tax or insurance due dates',
            formatter: (value: number) => `${value >= 0 ? '+' : ''}${value} days`,
          },
          {
            key: 'graceDays',
            label: 'Grace period extension',
            min: 0,
            max: 20,
            step: 1,
            suffix: ' days',
            helper: 'Buffer before shortage escalation',
          },
        ],
      },
      exception: {
        sliders: [
          {
            key: 'feeWaiver',
            label: 'Fee waiver coverage',
            min: 0,
            max: 100,
            step: 5,
            suffix: '%',
            helper: 'Percent of cases receiving fee relief',
          },
          {
            key: 'repaymentMonths',
            label: 'Repayment plan length',
            min: 3,
            max: 12,
            step: 1,
            suffix: ' months',
          },
        ],
      },
    }),
    [],
  );

  const demoOutputs: Record<ExtensionId, DemoResult> = useMemo(() => {
    const outputs = {} as Record<ExtensionId, DemoResult>;

    const batchInputs = demoInputs.batch ?? {};
    const shiftDays = batchInputs.shiftDays ?? 0;
    const graceDays = batchInputs.graceDays ?? 0;
    const netShift = shiftDays - graceDays;
    const baseExposureFactor =
      datasetMetrics.avgUpcomingPayment * datasetMetrics.upcomingPayments * 0.08;
    const exposureChange = netShift * baseExposureFactor;
    const queueChange = netShift >= 0
      ? Math.round(Math.max(netShift, 0) * datasetMetrics.upcomingPayments * 0.04)
      : -Math.round(Math.abs(netShift) * datasetMetrics.upcomingPayments * 0.03);
    const opsHours = Math.max(0, Math.round(Math.abs(queueChange) * 0.75));
    outputs.batch = {
      stats: [
        {
          label: 'Net timeline shift',
          value: `${netShift >= 0 ? '+' : ''}${netShift} days`,
          helper: `${shiftDays} day billing move minus ${graceDays} day grace`,
        },
        {
          label: netShift >= 0 ? 'Exposure increase' : 'Exposure reduction',
          value: `${netShift >= 0 ? '+' : '-'}${formatCurrency(Math.abs(exposureChange))}`,
          helper: '30-day projection',
        },
        {
          label: 'Work queue change',
          value: `${queueChange >= 0 ? '+' : '-'}${formatNumber(Math.abs(queueChange))}`,
          helper: `${formatNumber(opsHours)} ops hours`,
        },
      ],
      insights: [
        `${shiftDays >= 0 ? 'Delays' : 'Accelerating'} billing by ${Math.abs(shiftDays)} days ${
          shiftDays >= 0 ? 'adds' : 'removes'
        } ${formatNumber(Math.abs(queueChange))} borrower touches.`,
        `Extending grace by ${graceDays} days offsets ${formatCurrency(
          Math.max(0, graceDays * datasetMetrics.avgUpcomingPayment * 0.12),
        )} in new shortages.`,
        `${opsHours} ops hours are ${queueChange >= 0 ? 'required' : 'freed up'} to handle the shift.`,
      ],
    };

    const exceptionInputs = demoInputs.exception ?? {};
    const feeWaiver = exceptionInputs.feeWaiver ?? 0;
    const repaymentMonths = exceptionInputs.repaymentMonths ?? 6;
    const baselineResolution = 26;
    const resolutionImprovement = feeWaiver * 0.15 + Math.max(0, 12 - repaymentMonths) * 2;
    const resolutionTime = Math.max(10, Math.round(baselineResolution - resolutionImprovement));
    const agentHoursSaved = Math.max(
      0,
      Math.round(datasetMetrics.highRiskCount * (feeWaiver / 100) * 1.5),
    );
    const goodwillBoost = Math.max(
      0,
      Math.round(feeWaiver * 0.2 + Math.max(0, 12 - repaymentMonths) * 1.5),
    );
    outputs.exception = {
      stats: [
        {
          label: 'Avg resolution time',
          value: `${resolutionTime} days`,
          helper: `${baselineResolution - resolutionTime} days faster than baseline`,
        },
        {
          label: 'Agent hours saved',
          value: formatNumber(agentHoursSaved),
          helper: 'Per 100 exceptions',
        },
        {
          label: 'Borrower goodwill',
          value: `+${goodwillBoost} pts`,
          helper: 'Satisfaction composite',
        },
      ],
      insights: [
        `${feeWaiver}% fee coverage trims resolution time to ${resolutionTime} days.`,
        `Repayment plans of ${repaymentMonths} months keep borrowers compliant without overextending staff.`,
        `Expect ${formatNumber(agentHoursSaved)} agent hours saved for every 100 cases.`,
      ],
    };

    return outputs;
  }, [datasetMetrics, demoInputs]);

  const activePrototypeConfig = useMemo(
    () => backOfficeExtensions.find((feature) => feature.id === activePrototype) ?? null,
    [activePrototype, backOfficeExtensions],
  );
  const activeDemoConfig = activePrototype ? demoConfigs[activePrototype] : null;
  const activeDemoResult = activePrototype ? demoOutputs[activePrototype] : null;
  const activeDemoInputs = activePrototype ? demoInputs[activePrototype] : null;

  const handleSliderChange = (id: ExtensionId, key: string, value: number) => {
    setDemoInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

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

        <section className="rounded-3xl border border-[#c7d2fe] bg-white/90 px-6 sm:px-8 py-8 shadow-sm space-y-8">
          <header className="space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ede9fe] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5b21b6]">
              Back-office extensions
            </span>
            <h3 className="text-xl font-semibold text-slate-900">Go beyond the core scenario modeler</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              These companion workflows turn &ldquo;what-if&rdquo; experiments into operational decisions for treasury, payments, and compliance teams.
              Use them to rehearse policy changes, size outreach queues, and brief leadership before anything goes live.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {backOfficeExtensions.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#c7d2fe]/60 bg-gradient-to-br from-white via-white to-[#f5f3ff] p-6 shadow-sm space-y-4"
            >
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.summary}</p>
                </div>
                <div className="rounded-xl border border-[#ddd6fe] bg-[#ede9fe]/70 px-4 py-3 text-xs text-[#4c1d95] font-medium uppercase tracking-wide">
                  Impact: {feature.impact}
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {feature.actions.map((action) => (
                    <li key={action} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#7c3aed]" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              <button
                type="button"
                onClick={() =>
                  setActivePrototype((prev) => (prev === feature.id ? null : feature.id))
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#7c3aed] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#5b21b6]"
              >
                {activePrototype === feature.id ? 'Hide interaction demo' : 'Launch interaction demo'}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H7" />
                </svg>
              </button>
              </article>
            ))}
          </div>
        </section>

        {activePrototypeConfig && activeDemoConfig && activeDemoResult && activeDemoInputs ? (
          <section
            ref={demoSectionRef}
            className="rounded-3xl border border-[#c7d2fe] bg-white/95 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] space-y-8"
          >
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2 max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ede9fe] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5b21b6]">
                  {activePrototypeConfig.prototype.kicker}
                </span>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {activePrototypeConfig.prototype.title} interactive demo
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {activePrototypeConfig.prototype.description}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePrototype(null)}
                className="self-start inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:border-[#c7d2fe] hover:text-[#5b21b6]"
              >
                Close demo
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4">
                {activeDemoConfig.sliders.map((slider) => {
                  const rawValue = activeDemoInputs[slider.key] ?? slider.min ?? 0;
                  const displayValue = slider.formatter
                    ? slider.formatter(rawValue)
                    : `${rawValue}${slider.suffix ?? ''}`;

                  return (
                    <div
                      key={slider.key}
                      className="rounded-2xl border border-[#c7d2fe]/60 bg-white px-4 py-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{slider.label}</p>
                          {slider.helper ? <p className="mt-1 text-xs text-gray-500">{slider.helper}</p> : null}
                        </div>
                        <span className="text-sm font-semibold text-[#5b21b6]">{displayValue}</span>
                      </div>
                      <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={rawValue}
                        onChange={(event) =>
                          handleSliderChange(activePrototype as ExtensionId, slider.key, Number(event.target.value))
                        }
                        className="w-full accent-[#7c3aed]"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {activeDemoResult.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[#c7d2fe]/60 bg-gradient-to-br from-white via-white to-[#f5f3ff] p-4 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#5b21b6]">{stat.label}</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{stat.value}</p>
                      {stat.helper ? <p className="mt-1 text-xs text-gray-500">{stat.helper}</p> : null}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 shadow-inner">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Focus actions</h4>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
                    {activeDemoResult.insights.map((insight) => (
                      <li key={insight}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ) : null}

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

