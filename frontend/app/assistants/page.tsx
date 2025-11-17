'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import PageIntro from '../components/PageIntro';
import AIChatWidget from '../components/AIChatWidget';
import CopilotPreview, { CopilotPreviewProps } from '../components/CopilotPreview';
import {
  calculateMetrics,
  segmentByRisk,
  getInteractionTypes,
  getUpcomingPayments,
} from '../utils/calculations';
import { useEscrowData } from '../hooks/useEscrowData';

type AssistantId = 'borrower' | 'dailyDigest' | 'conversation' | 'sentiment' | 'outreach' | 'county';

export default function AssistantsPage() {
  const { data, loading, error } = useEscrowData();
  const [activeAssistant, setActiveAssistant] = useState<AssistantId | null>(null);
  const detailAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeAssistant && detailAnchorRef.current) {
      detailAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeAssistant]);

  const metrics = useMemo(() => calculateMetrics(data), [data]);
  const segmentation = useMemo(() => segmentByRisk(data), [data]);
  const interactionTypes = useMemo(() => getInteractionTypes(data), [data]);
  const upcomingPayments = useMemo(() => getUpcomingPayments(data, 30, 10), [data]);
  const interactionCount = useMemo(
    () => Object.values(interactionTypes).reduce((sum, val) => sum + val, 0),
    [interactionTypes],
  );
  const shortageQueue = useMemo(
    () => data.filter((record) => record['Forecasted Escrow Shortage'] > 0),
    [data],
  );
  const countyCount = useMemo(() => new Set(data.map((record) => record.County)).size, [data]);
  const interactionChannels = useMemo(() => Object.keys(interactionTypes).length, [interactionTypes]);

  const formatNumber = (value: number) => value.toLocaleString('en-US');
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);

  const assistantDetails: Record<AssistantId, CopilotPreviewProps> = {
    borrower: {
      accent: 'critical',
      label: 'Workflow snapshot',
      title: 'Escrow shortage triage assistant',
      summary: `Triage shortage exposure and prep outreach sequences across ${formatNumber(
        segmentation.highRisk.length,
      )} high-risk borrowers in minutes.`,
      stats: [
        {
          label: 'High-risk borrowers',
          value: formatNumber(segmentation.highRisk.length),
        },
        {
          label: 'Shortage queue',
          value: formatNumber(shortageQueue.length),
          helper: 'Borrowers flagged for near-term outreach',
        },
        {
          label: 'Avg at-risk shortage',
          value: formatCurrency(metrics.avgShortage || 0),
          helper: 'Borrowers with $2K+ forecasted shortage',
        },
      ],
      highlights: [
        {
          title: 'Portfolio pulse',
          body: 'Flag borrowers poised to exhaust reserves within the next 60 days.',
        },
        {
          title: 'Guided playbooks',
          body: 'Surface scripts and cadence recommendations tuned to delinquency signals.',
        },
        {
          title: 'Action exports',
          body: 'Download rosters, script packs, and CRM-ready notes in one step.',
        },
      ],
      prompts: [
        'Who is 45 days from escrow exhaustion?',
        'Draft a hardship email for Harris County',
        'Group borrowers by root-cause driver',
      ],
      storyline: [
        {
          speaker: 'You',
          text: 'Show borrowers in Southeast counties likely to hit a shortage in 60 days.',
        },
        {
          speaker: 'Assistant',
          text: 'Flagged high-risk borrowers with drivers like reassessments, premium hikes, and missed adjustments.',
        },
        {
          speaker: 'Assistant',
          text: 'Generated outreach cadence plus hardship-ready talking points and exportable roster.',
        },
      ],
      infoBlocks: [
        {
          title: 'Best for',
          items: ['Servicing leads', 'Borrower outreach pods', 'Escalation huddles'],
        },
        {
          title: 'Try it now',
          items: [
            'Pick a borrower slice from the sample data',
            'Ask for drivers or next-best action',
            'Download the outreach pack',
          ],
        },
        {
          title: 'Roadmap',
          items: ['Live escrow data feed', 'Multi-borrower scenario builder', 'CRM sync for commitments'],
        },
      ],
    },
    dailyDigest: {
      accent: 'info',
      label: 'Workflow snapshot',
      title: 'Executive briefing copilot',
      summary: `Spin executive-ready digests summarizing ${formatNumber(
        interactionCount,
      )} recent interactions, shortages, and outreach wins.`,
      stats: [
        {
          label: 'Interactions tracked',
          value: formatNumber(interactionCount),
          helper: 'Across all channels in the dataset',
        },
        {
          label: 'Upcoming payments',
          value: formatNumber(upcomingPayments.length),
          helper: 'Due within 30 days',
        },
        {
          label: 'At-risk borrowers',
          value: formatNumber(metrics.customersWithShortage),
          helper: '$2K+ shortage exposure',
        },
      ],
      highlights: [
        {
          title: 'KPI pulseboard',
          body: 'Spot shortage exposure, reserve trends, and outreach velocity at a glance.',
        },
        {
          title: 'Narrated storyline',
          body: 'Draft leadership-ready talking points with highlights, risks, and next moves.',
        },
        {
          title: 'Attachment bundle',
          body: 'Package charts and links so stakeholders dive deeper without extra prep.',
        },
      ],
      prompts: [
        "Draft tomorrow's digest on shortages and outreach wins",
        'Highlight payment exceptions for leadership',
        'Add a call-out on county risk shifts',
      ],
      storyline: [
        {
          speaker: 'You',
          text: 'Draft the daily digest focused on shortages and outreach wins.',
        },
        {
          speaker: 'Assistant',
          text: 'Highlights shortage reductions and proactive outreach wins with next-day focus.',
        },
        {
          speaker: 'Assistant',
          text: 'Attached KPI snapshot and trend exports - ready to send or download as PDF.',
        },
      ],
      infoBlocks: [
        {
          title: 'Ideal audience',
          items: ['Leadership updates', 'Risk and finance partners', 'Ops stand-ups'],
        },
        {
          title: 'Quick steps',
          items: [
            'Choose cadence in the mock controls',
            'Ask for deeper drill-downs by metric',
            'Export the digest or copy the email draft',
          ],
        },
        {
          title: 'Next up',
          items: ['Dynamic chart embeds', 'Approval workflows', 'Automated distribution lists'],
        },
      ],
    },
    conversation: {
      accent: 'info',
      label: 'Workflow snapshot',
      title: 'Conversation summarizer',
      summary:
        'Collapse cross-channel conversations into shareable recaps that capture intent, escalations, and owners.',
      stats: [
        {
          label: 'Interactions summarized',
          value: formatNumber(interactionCount),
        },
        {
          label: 'Channels',
          value: formatNumber(interactionChannels),
          helper: 'Distinct interaction types in dataset',
        },
        {
          label: 'Borrower records',
          value: formatNumber(metrics.totalCustomers),
          helper: 'Records inside the demo dataset',
        },
      ],
      highlights: [
        {
          title: 'Channel-aware insights',
          body: 'Roll up phone, chat, and email moments with status at a glance.',
        },
        {
          title: 'Follow-up playbooks',
          body: 'Assign next owners, cadence, and compliance scripting automatically.',
        },
        {
          title: 'Export-ready packets',
          body: 'Push summaries into CRM notes or leadership briefs instantly.',
        },
      ],
      prompts: [
        "Summarize today's calls about escrow increases",
        'Highlight escalations that need supervisor review',
        'Draft follow-up notes for the night shift team',
      ],
      storyline: [
        {
          speaker: 'You',
          text: "Summarize today's inbound calls about escrow increases from Florida borrowers.",
        },
        {
          speaker: 'Assistant',
          text: 'Recaps drivers across calls, highlighting reassessments, premium hikes, and supervisor escalations.',
        },
        {
          speaker: 'Assistant',
          text: 'Suggested follow-up template, flagged hardship candidates, and generated unresolved list.',
        },
      ],
      infoBlocks: [
        {
          title: 'Great for',
          items: ['Interaction ops teams', 'QA and coaching huddles', 'Shift hand-offs'],
        },
        {
          title: 'How to use',
          items: [
            'Pick a timeframe in the demo controls',
            'Filter by issue type or geography',
            'Export channel-specific recaps',
          ],
        },
        {
          title: 'Roadmap',
          items: ['Sentiment trending charts', 'CRM auto-sync', 'Keyword-triggered alerts'],
        },
      ],
    },
    sentiment: {
      accent: 'success',
      label: 'Workflow snapshot',
      title: 'AI sentiment coach',
      summary:
        'Score empathy, tension, and resolution quality to coach agents with instant reinforcement loops.',
      stats: [
        {
          label: 'Interactions ready',
          value: formatNumber(interactionCount),
        },
        {
          label: 'High-risk borrowers',
          value: formatNumber(segmentation.highRisk.length),
        },
        {
          label: 'Avg at-risk shortage',
          value: formatCurrency(metrics.avgShortage || 0),
        },
      ],
      highlights: [
        {
          title: 'Emotion pulse',
          body: 'Track sentiment swings and compliance tone through every conversation.',
        },
        {
          title: 'Coaching cues',
          body: 'Pinpoint praise, adjustments, and language to reduce escalation risk.',
        },
        {
          title: 'Scorecard exports',
          body: 'Deliver QA-ready scorecards with charts, comments, and action items.',
        },
      ],
      prompts: [
        "Score empathy for Aaron's last three calls",
        'Surface tension spikes for Florida borrowers',
        'Draft praise for the top-performing agent',
      ],
      storyline: [
        {
          speaker: 'You',
          text: "Score the empathy and resolution quality from Aaron's last three shortage calls.",
        },
        {
          speaker: 'Assistant',
          text: 'Summarizes sentiment swing, standout empathy moments, and tension spikes during shortage math.',
        },
        {
          speaker: 'Assistant',
          text: "Generated coaching snapshot with praise, adjustments, and tomorrow's listening checklist.",
        },
      ],
      infoBlocks: [
        {
          title: 'Best for',
          items: ['Team leads and QA', 'Coaching cadences', 'Performance reviews'],
        },
        {
          title: 'In the demo',
          items: [
            'Choose an agent or issue type',
            'Ask for empathy, tension, or compliance cues',
            'Download the coaching scorecard',
          ],
        },
        {
          title: 'Planned',
          items: ['Auto-coaching nudges', 'Supervisor trend dashboards', 'Performance tool integrations'],
        },
      ],
    },
    outreach: {
      accent: 'critical',
      label: 'Workflow snapshot',
      title: 'AI shortage negotiator',
      summary: `Craft negotiation scripts and payment plans for ${formatNumber(
        shortageQueue.length,
      )} borrowers in the shortage queue.`,
      stats: [
        {
          label: 'Shortage queue',
          value: formatNumber(shortageQueue.length),
        },
        {
          label: 'Upcoming payments',
          value: formatNumber(upcomingPayments.length),
          helper: 'Due inside 30 days',
        },
        {
          label: 'Avg at-risk shortage',
          value: formatCurrency(metrics.avgShortage || 0),
        },
      ],
      highlights: [
        {
          title: 'Shortage briefing',
          body: 'Condense exposure, timelines, and prior outreach into a quick read.',
        },
        {
          title: 'Negotiation playbook',
          body: 'Suggest call, SMS, and email language tuned to borrower posture.',
        },
        {
          title: 'Follow-up automation',
          body: 'Generate reminders, escalation triggers, and note templates.',
        },
      ],
      prompts: [
        'Draft an outreach email for borrowers in Harris County',
        'Show borrowers 45 days from escrow exhaustion',
        'Recommend an SMS sequence for hardship candidates',
      ],
      storyline: [
        {
          speaker: 'You',
          text: 'Draft an outreach email for borrowers 45 days from escrow exhaustion in Harris County.',
        },
        {
          speaker: 'Assistant',
          text: 'Suggested a three-installment catch-up plan with hardship resources and follow-up cadence.',
        },
        {
          speaker: 'Assistant',
          text: 'Produced voice, SMS, and email variants plus a disposition checklist ready for export.',
        },
      ],
      infoBlocks: [
        {
          title: 'Ideal users',
          items: ['Borrower outreach pods', 'Loss mitigation teams', 'Hardship support desks'],
        },
        {
          title: 'First run',
          items: [
            'Select a borrower cohort from the sample list',
            'Ask for scripting or negotiation tactics',
            'Export the script pack and schedule',
          ],
        },
        {
          title: 'Coming soon',
          items: ['Promise-to-pay tracking', 'Outcome analytics', 'Live compliance guardrails'],
        },
      ],
    },
    county: {
      accent: 'info',
      label: 'Workflow snapshot',
      title: 'County risk intelligence bot',
      summary: `Compare county drivers, regulatory callouts, and outreach priorities across ${formatNumber(
        countyCount,
      )} counties.`,
      stats: [
        {
          label: 'Counties tracked',
          value: formatNumber(countyCount),
        },
        {
          label: 'High-risk borrowers',
          value: formatNumber(segmentation.highRisk.length),
        },
        {
          label: 'Upcoming payments',
          value: formatNumber(upcomingPayments.length),
        },
      ],
      highlights: [
        {
          title: 'Risk trend snapshot',
          body: 'See delinquency velocity, shortage exposure, and premium shifts per county.',
        },
        {
          title: 'Regulation radar',
          body: 'Flag legislative updates and compliance checkpoints that matter locally.',
        },
        {
          title: 'Action recommendations',
          body: 'Queue outreach priorities and partnerships to stabilize cushions.',
        },
      ],
      prompts: [
        'What is pushing shortages in Maricopa and Pinal?',
        'Compare regulatory changes for Fulton and DeKalb counties',
        'Suggest outreach priorities for Arizona counties',
      ],
      storyline: [
        {
          speaker: 'You',
          text: 'What county-level factors are pushing shortages in Maricopa and Pinal?',
        },
        {
          speaker: 'Assistant',
          text: 'Maricopa tied to premium hikes and HOA shortages; Pinal driven by reassessments and late remittances.',
        },
        {
          speaker: 'Assistant',
          text: 'Recommended carrier coordination, tax liaison outreach, and monitoring cohort updates.',
        },
      ],
      infoBlocks: [
        {
          title: 'Teams to involve',
          items: ['Regional leads', 'Compliance partners', 'Market intel analysts'],
        },
        {
          title: 'Steps in demo',
          items: [
            'Select one or more counties in the sample',
            'Ask for regulatory, carrier, or persona context',
            'Download the regional brief for sharing',
          ],
        },
        {
          title: 'Future additions',
          items: ['Live data feeds', 'Early-warning alerts', 'Peer benchmarking'],
        },
      ],
    },
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

  const assistantCards = [
    {
      id: 'borrower' as const,
      title: 'Escrow shortage triage assistant',
      description: `Guides agents through borrower outreach sequences, drafts personalized messages, and surfaces risk drivers instantly across ${formatNumber(
        segmentation.highRisk.length,
      )} high-risk accounts.`,
      ctaLabel: 'Chat about a borrower portfolio',
      tone: 'critical' as const,
      tags: ['Overview', 'Shortages', 'Servicing'],
    },
    {
      id: 'dailyDigest' as const,
      title: 'Executive briefing copilot',
      description: `Summarizes KPIs, builds leadership-ready talking points, and flags emerging trends across ${formatNumber(
        interactionCount,
      )} recent interactions.`,
      ctaLabel: 'Draft my daily digest',
      tone: 'info' as const,
      tags: ['Overview', 'Leadership', 'Analytics'],
    },
    {
      id: 'conversation' as const,
      title: 'Conversation summarizer',
      description: `Produces instant recaps of inbound ${formatNumber(
        interactionCount,
      )} interactions and suggests follow-up cadences for each channel.`,
      ctaLabel: 'Summarize today’s calls',
      tone: 'info' as const,
      tags: ['Interactions', 'Servicing Desk'],
    },
    {
      id: 'sentiment' as const,
      title: 'AI sentiment coach',
      description: 'Analyzes call transcripts, scores borrower sentiment, and recommends behavioral cues for your next outreach.',
      ctaLabel: 'Review my coaching tips',
      tone: 'success' as const,
      tags: ['Interactions', 'Coaching'],
    },
    {
      id: 'outreach' as const,
      title: 'AI shortage negotiator',
      description: `Simulates repayment plans, drafts hardship responses, and recommends tailored contact strategies for ${formatNumber(
        shortageQueue.length,
      )} borrowers in the shortage queue.`,
      ctaLabel: 'Draft an outreach script',
      tone: 'critical' as const,
      tags: ['Shortages', 'Hardship Support'],
    },
    {
      id: 'county' as const,
      title: 'County risk intelligence bot',
      description: 'Answers questions about county-level drivers, regulatory requirements, and signals that impact escrow cushions.',
      ctaLabel: 'Ask about county trends',
      tone: 'info' as const,
      tags: ['Shortages', 'Compliance', 'Market Intel'],
    },
  ];

  const renderDetailSection = () => {
    if (!activeAssistant) {
        return (
          <section className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 sm:px-8 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Select a copilot to preview its workflow</h2>
            <p className="mt-2 text-sm text-gray-600">
            Choose any assistant above to open a lighter, scannable walkthrough with prompts, sample outputs, and rollout notes.
            </p>
          </section>
        );
    }

    const detail = assistantDetails[activeAssistant];

    if (!detail) {
      return null;
    }

    return <CopilotPreview {...detail} />;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <PageIntro
          kicker="AI Copilot Lab"
          title="Explore copilots built for escrow servicing teams"
          description={`Centralize every AI workflow concept in one launchpad. Review prototypes, see where they plug in, and decide which copilots to activate next.`}
          actions={null}
        />

        <div className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Copilot directory</h3>
              <p className="mt-2 text-sm text-gray-600">
                Click any card to preview its scripted experience, sample transcripts, and delivery roadmap. Tags show where each copilot
                shines inside the dashboard workflow.
              </p>
            </div>
            <div className="inline-flex overflow-hidden rounded-full border border-[#d32f2f]/30 bg-[#ffebee]/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#b71c1c]">
              {formatNumber(segmentation.highRisk.length)} high-risk borrowers • {formatNumber(upcomingPayments.length)} upcoming payments •{' '}
              {formatNumber(interactionCount)} interactions
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assistantCards.map((assistant) => (
              <AIChatWidget
                key={assistant.id}
                title={assistant.title}
                description={assistant.description}
                ctaLabel={assistant.ctaLabel}
                tone={assistant.tone}
                tags={assistant.tags}
                onCtaClick={() =>
                  setActiveAssistant((prev) => (prev === assistant.id ? null : assistant.id))
                }
                comingSoonLabel={activeAssistant === assistant.id ? 'Selected' : 'Prototype'}
              />
            ))}
          </div>
        </div>

        <div ref={detailAnchorRef} />
        {renderDetailSection()}
      </main>
    </div>
  );
}

