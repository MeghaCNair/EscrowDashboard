'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import PageIntro from '../components/PageIntro';
import AIChatWidget from '../components/AIChatWidget';
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

  const formatNumber = (value: number) => value.toLocaleString('en-US');

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
    switch (activeAssistant) {
      case 'borrower':
        return (
          <section className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ffebee] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b71c1c]">
              Demo walkthrough
            </span>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Escrow shortage triage assistant preview</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Launch &ldquo;Chat about a borrower portfolio&rdquo; to simulate how the copilot triages shortage exposure. The demo
                  analyzes a sample borrower set, surfaces drivers behind variances, and recommends the next outreach move so your agents
                  can stay proactive.
                </p>
              </div>
              <div className="rounded-2xl border border-[#ffebee] bg-[#fff5f5] px-4 py-3 text-xs font-medium text-[#b71c1c] shadow-sm">
                First release scope • Portfolio-level Q&amp;A • Outreach drafts
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#ffebee] bg-gradient-to-br from-[#fff5f5] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Portfolio health scan</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Instantly tallies shortage exposure, reserve depletion timelines, and the borrowers contributing the most risk in the
                  selected portfolio slice.
                </p>
              </div>
              <div className="rounded-2xl border border-[#fde68a] bg-gradient-to-br from-[#fffbeb] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Triage playbook builder</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Suggests contact cadences, payment plan scenarios, and hardship assistance talking points aligned to each borrower&rsquo;s
                  delinquency signal.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d1fae5] bg-gradient-to-br from-[#ecfdf5] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Action-ready exports</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Generates outreach scripts, recap summaries, and CSV-ready borrower lists so teams can push updates straight into their
                  servicing workflow.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-900/40 bg-slate-900 p-6 text-slate-100 shadow-inner">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                Live demo transcript
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-semibold text-sky-300">You</p>
                  <p className="mt-1 text-slate-200">Show me borrowers in Southeast counties likely to hit a shortage in 60 days.</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    18 borrowers match. Average cushion drops below required minimum in 47 days. Top three drivers are tax reassessments in
                    Fulton, policy premium increases in DeKalb, and missed escrow adjustments in Gwinnett.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Drafted a three-step outreach plan plus hardship follow-up script. Download the borrower roster or ask for an email ready
                    summary.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">How to use the demo</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
                  <li>Select any borrower cohort from the dropdown samples.</li>
                  <li>Ask a follow-up question about risk drivers or outreach options.</li>
                  <li>Download the generated script pack to review with servicing.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">What’s next</h4>
                <p className="mt-2 text-sm text-gray-600">
                  We&rsquo;re wiring in live escrow data, multi-borrower what-if scenarios, and CRM actions so this copilot can move from concept
                  to production quickly.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Feedback loop</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Share additional prompts or workflows your team wants covered, and we&rsquo;ll fold them into the rollout backlog.
                </p>
              </div>
            </div>
          </section>
        );
      case 'dailyDigest':
        return (
          <section className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e3f2fd] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0d47a1]">
              Demo walkthrough
            </span>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Executive briefing copilot preview</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Activate &ldquo;Draft my daily digest&rdquo; to see how the copilot distills the latest servicing signals into a shareable briefing.
                  The demo assembles KPIs, borrower sentiment, and backlog snapshots into a ready-to-send update.
                </p>
              </div>
              <div className="rounded-2xl border border-[#bbdefb] bg-[#e8f3ff] px-4 py-3 text-xs font-medium text-[#0d47a1] shadow-sm">
                First release scope • Cross-channel rollups • Leadership-ready copy
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#bbdefb] bg-gradient-to-br from-[#e8f3ff] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">KPI pulseboard</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Condenses escrow balances, shortage exposure, and payment exceptions into an at-a-glance executive scorecard.
                </p>
              </div>
              <div className="rounded-2xl border border-[#c7d2fe] bg-gradient-to-br from-[#eef2ff] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Narrated storyline</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Produces a structured email draft with highlights, risks, and recommended actions tailored to leadership tone.
                </p>
              </div>
              <div className="rounded-2xl border border-[#bae6fd] bg-gradient-to-br from-[#e0f2fe] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Attachment-ready assets</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Packages charts, interaction heatmaps, and export links so stakeholders can dive deeper without extra prep.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-900/20 bg-slate-900 p-6 text-slate-100 shadow-inner">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
                Live demo transcript
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-semibold text-sky-300">You</p>
                  <p className="mt-1 text-slate-200">Draft the daily digest for leadership focused on shortages and outreach wins.</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Opening lines summarize 6% shortage reduction and 42 proactive borrower outreaches. Added bullet recap of county risk
                    shifts plus tomorrow&rsquo;s attention items.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Attached KPI snapshot PNG and interaction trend CSV. Ready to copy into email or export as PDF.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">How to use the demo</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
                  <li>Pick the reporting cadence (daily, weekly, or ad-hoc) inside the demo controls.</li>
                  <li>Ask for extra context like shortage drill-downs or outreach velocity.</li>
                  <li>Download the finalized briefing or push it into your comms workspace.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">What’s next</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Shipping integrations for dynamic chart embeds, approval workflows, and automated distribution lists.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Feedback loop</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Tell us which KPIs or narratives you want standardized and we&rsquo;ll add templates to the copilot backlog.
                </p>
              </div>
            </div>
          </section>
        );
      case 'conversation':
        return (
          <section className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#cfe0fc] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0d47a1]">
              Demo walkthrough
            </span>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Conversation summarizer preview</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Launch the summarizer to collapse day-of calls, chats, and secure messages into crisp bullet recaps. It captures borrower
                  intents, escalations, and next-touch assignments so servicing teams can hand off without re-listening.
                </p>
              </div>
              <div className="rounded-2xl border border-[#cfe0fc] bg-[#e8f1ff] px-4 py-3 text-xs font-medium text-[#0d47a1] shadow-sm">
                Ideal for Interaction ops • Quality audits • End-of-day recaps
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#cfe0fc] bg-gradient-to-br from-[#e8f1ff] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Channel-aware insights</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Rolls up phone, chat, and email threads with channel-specific highlights and resolution status.
                </p>
              </div>
              <div className="rounded-2xl border border-[#bbf7d0] bg-gradient-to-br from-[#dcfce7] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Follow-up playbooks</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Suggests who owns the next action, recommended cadence, and any compliance scripting required before sending.
                </p>
              </div>
              <div className="rounded-2xl border border-[#fde68a] bg-gradient-to-br from-[#fffbeb] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Export-ready packets</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Generates summaries tuned for leadership emails, CRM notes, or ticketing attachments with one click.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-900/20 bg-slate-900 p-6 text-slate-100 shadow-inner">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
                Live demo transcript
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-semibold text-sky-300">You</p>
                  <p className="mt-1 text-slate-200">Summarize today&rsquo;s inbound calls about escrow increases from Florida borrowers.</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    24 calls logged. Primary drivers were tax reassessments (14) and insurance premium hikes (7). Most callers requested payment
                    plan guidance; three escalations handed to supervisors.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Suggested a follow-up email template, flagged two borrowers for hardship outreach, and generated a CSV of unresolved items.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">How to use the demo</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
                  <li>Select a timeframe (shift, day, or custom date range).</li>
                  <li>Focus the summary on issue type, geography, or agent cohort.</li>
                  <li>Download channel-specific recaps to share with ops and QA.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">What’s next</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Building sentiment trending charts, CRM auto-sync, and exception alerts triggered off summary keywords.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Feedback loop</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Tell us which call dispositions or customer intents you want highlighted so the summarizer mirrors your coaching playbook.
                </p>
              </div>
            </div>
          </section>
        );
      case 'sentiment':
        return (
          <section className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#166534]">
              Demo walkthrough
            </span>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">AI sentiment coach preview</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Invite the sentiment coach to score empathy, tension, and resolution quality in every conversation. It spotlights coaching
                  moments, generates positive reinforcement snippets, and recommends behavioral cues for the next outreach.
                </p>
              </div>
              <div className="rounded-2xl border border-[#bbf7d0] bg-[#ecfdf5] px-4 py-3 text-xs font-medium text-[#166534] shadow-sm">
                Ideal for Team leads • QA reviews • Coaching cadences
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#bbf7d0] bg-gradient-to-br from-[#ecfdf5] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Emotion pulse</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Tracks borrower sentiment swings, empathy alignment, and compliance tone across the entire interaction.
                </p>
              </div>
              <div className="rounded-2xl border border-[#fde68a] bg-gradient-to-br from-[#fffbeb] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Coaching cues</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Highlights specific moments to reinforce, plus phrasing adjustments that could reduce escalation risk next time.
                </p>
              </div>
              <div className="rounded-2xl border border-[#c4b5fd] bg-gradient-to-br from-[#ede9fe] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Scorecard exports</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Outputs QA-ready scorecards with sentiment charts, coaching comments, and action items for both agent and lead.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-900/20 bg-slate-900 p-6 text-slate-100 shadow-inner">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                Live demo transcript
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-semibold text-sky-300">You</p>
                  <p className="mt-1 text-slate-200">Score the empathy and resolution quality from Aaron&rsquo;s last three shortage calls.</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Average sentiment improved to 3.8/5. Most positive moment at minute 6 when hardship plan explained. Tension spiked when
                    discussing escrow shortage math; provided rephrasing suggestion.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Generated coaching snapshot with praise, adjustments, and a listening checkpoint list for tomorrow&rsquo;s stand-up.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">How to use the demo</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
                  <li>Choose an agent, team, or interaction reason to review.</li>
                  <li>Ask the copilot to surface empathy, tension, or resolution insights.</li>
                  <li>Download the scorecard to use in 1:1s or QA calibration sessions.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">What’s next</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Adding auto-coaching nudges, supervisor trend dashboards, and integration with performance management tools.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Feedback loop</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Share the coaching rubrics you follow so we can align scoring thresholds and highlight the right behavioral wins.
                </p>
              </div>
            </div>
          </section>
        );
      case 'outreach':
        return (
          <section className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#ffebee] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#b71c1c]">
              Demo walkthrough
            </span>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">AI shortage negotiator preview</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Launch &ldquo;Draft an outreach script&rdquo; to test how the copilot orchestrates borrower negotiations. The demo analyzes shortage
                  severity, hardship indicators, and payment history to craft contact plans your agents can deploy instantly.
                </p>
              </div>
              <div className="rounded-2xl border border-[#ffebee] bg-[#fff5f5] px-4 py-3 text-xs font-medium text-[#b71c1c] shadow-sm">
                First release scope • Hardship language • Payment plan scenarios
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#ffebee] bg-gradient-to-br from-[#fff5f5] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Shortage impact briefing</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Condenses escrow gaps, projected delinquency dates, and prior outreach attempts into a quick read for reps.
                </p>
              </div>
              <div className="rounded-2xl border border-[#fde68a] bg-gradient-to-br from-[#fffbeb] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Negotiation playbook</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Suggests call scripts, SMS drafts, and hardship acknowledgement language tuned to the borrower&rsquo;s region and risk posture.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d1fae5] bg-gradient-to-br from-[#ecfdf5] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Follow-up automation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Generates next-touch reminders, escalation triggers, and note-taking templates so no commitments fall through.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-900/40 bg-slate-900 p-6 text-slate-100 shadow-inner">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                Live demo transcript
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-semibold text-sky-300">You</p>
                  <p className="mt-1 text-slate-200">
                    Draft an outreach email for borrowers 45 days from escrow exhaustion in Harris County.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Recommended a three-installment catch-up plan with hardship resources. Highlighted tax reassessment impact and proposed
                    follow-up cadence.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Generated voice, SMS, and email variants plus call disposition checklist. Ready to export or push to your CRM.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">How to use the demo</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
                  <li>Select a borrower segment, such as high-risk or hardship candidates.</li>
                  <li>Ask the assistant for tailored scripting or payment negotiation tactics.</li>
                  <li>Export the script pack and activity schedule to brief frontline teams.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">What’s next</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Upcoming releases include automatic promise-to-pay tracking, call outcome analytics, and live compliance guardrails.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Feedback loop</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Share the negotiation scenarios and hardship policies you want pre-loaded so the copilot reflects your servicing playbook.
                </p>
              </div>
            </div>
          </section>
        );
      case 'county':
        return (
          <section className="rounded-3xl border border-white bg-white/90 px-6 sm:px-8 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e3f2fd] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0d47a1]">
              Demo walkthrough
            </span>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">County risk intelligence bot preview</h2>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                  Trigger &ldquo;Ask about county trends&rdquo; to inspect localized drivers behind escrow volatility. The demo blends regulatory notes, tax
                  assessments, and claims history so you can brief regional teams in minutes.
                </p>
              </div>
              <div className="rounded-2xl border border-[#bbdefb] bg-[#e8f3ff] px-4 py-3 text-xs font-medium text-[#0d47a1] shadow-sm">
                First release scope • County scorecards • Regulatory callouts
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#bbdefb] bg-gradient-to-br from-[#e8f3ff] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Risk trend snapshot</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Surfaces delinquency velocity, shortage exposure, and premium shifts by county with on-hand comparisons.
                </p>
              </div>
              <div className="rounded-2xl border border-[#c7d2fe] bg-gradient-to-br from-[#eef2ff] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Regulation radar</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Flags recent legislative changes, escrow audit bulletins, and compliance checkpoints affecting that geography.
                </p>
              </div>
              <div className="rounded-2xl border border-[#bae6fd] bg-gradient-to-br from-[#e0f2fe] via-white to-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Action recommendations</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Provides targeted outreach priorities, partnership suggestions, and cross-county opportunities to stabilize cushions.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-900/20 bg-slate-900 p-6 text-slate-100 shadow-inner">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
                Live demo transcript
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="font-semibold text-sky-300">You</p>
                  <p className="mt-1 text-slate-200">What county-level factors are pushing shortages in Maricopa and Pinal?</p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Maricopa shortage growth tied to insurance premium hikes and HOA escrow shortages. Pinal driven by reassessments and late
                    tax remittances. Provided variance charts for both.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300">Assistant</p>
                  <p className="mt-1 text-slate-200">
                    Suggested outreach: coordinate with insurance carriers, schedule tax liaison outreach, and load flagged borrowers into a
                    monitoring cohort.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">How to use the demo</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
                  <li>Select one or multiple counties from the sample dataset.</li>
                  <li>Ask for regulatory updates, carrier dynamics, or borrower personas.</li>
                  <li>Download the generated brief to share with regional leads.</li>
                </ol>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">What’s next</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Roadmap includes live feed integrations, early-warning alerts, and benchmarking against national peers.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-slate-50 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Feedback loop</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Tell us which county datasets or regulatory trackers you rely on so we can deepen the knowledge base.
                </p>
              </div>
            </div>
          </section>
        );
      default:
        return (
          <section className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 sm:px-8 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Select a copilot to preview its workflow</h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose any AI assistant above to see a scripted demo, transcript, and rollout plan aligned to your shortage or interaction teams.
            </p>
          </section>
        );
    }
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

