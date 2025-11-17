'use client';

import { useEffect, useMemo, useState } from 'react';
import { EscrowData } from '../types/escrow';

interface ShortageTableProps {
  records: EscrowData[];
  pageSize?: number;
}

const riskStyles: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]',
  medium: 'bg-[#fff3e0] text-[#ef6c00] border border-[#ffe0b2]',
  low: 'bg-[#f1f8e9] text-[#558b2f] border border-[#dcedc8]',
};

type FeedbackTone = 'success' | 'info' | 'warning' | 'error';

interface FeedbackState {
  tone: FeedbackTone;
  message: string;
}

const feedbackToneStyles: Record<FeedbackTone, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-[#bbdefb] bg-[#e3f2fd] text-[#0d47a1]',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

function getRiskLevel(shortage: number): { label: string; tone: 'high' | 'medium' | 'low' } {
  if (shortage > 4000) {
    return { label: 'High', tone: 'high' };
  }
  if (shortage > 2000) {
    return { label: 'Medium', tone: 'medium' };
  }
  return { label: 'Low', tone: 'low' };
}

export default function ShortageTable({ records, pageSize = 15 }: ShortageTableProps) {
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selected, setSelected] = useState<EscrowData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b['Forecasted Escrow Shortage'] - a['Forecasted Escrow Shortage']),
    [records],
  );

  const filteredRecords = useMemo(() => {
    if (riskFilter === 'all') {
      return sortedRecords;
    }
    return sortedRecords.filter((record) => getRiskLevel(record['Forecasted Escrow Shortage']).tone === riskFilter);
  }, [sortedRecords, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * pageSize;
  const visible = filteredRecords.slice(offset, offset + pageSize);

  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  const handleFilterChange = (value: 'all' | 'high' | 'medium' | 'low') => {
    setRiskFilter(value);
    setPage(1);
  };

  const showFeedback = (tone: FeedbackTone, info: string) => {
    setFeedback({ tone, message: info });
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      showFeedback('info', 'Add a short note before sending a message to borrowers.');
      return;
    }

    if (filteredRecords.length === 0) {
      showFeedback('warning', 'No borrowers match the current filter. Try a different segment.');
      return;
    }

    setIsSending(true);
    const recipients = filteredRecords.map((record) => record['Loan Number']);
    setTimeout(() => {
      console.info('Sending message to loans:', recipients, 'Message:', message);
      setIsSending(false);
      setMessage('');
      showFeedback('success', `Message queued for ${recipients.length.toLocaleString('en-US')} borrowers.`);
    }, 600);
  };

  const renderFeedbackIcon = (tone: FeedbackTone) => {
    switch (tone) {
      case 'success':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 19a7 7 0 110-14 7 7 0 010 14z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 19a7 7 0 110-14 7 7 0 010 14z" />
          </svg>
        );
    }
  };

  const firstRow = filteredRecords.length === 0 ? 0 : offset + 1;
  const lastRow = filteredRecords.length === 0 ? 0 : Math.min(offset + visible.length, filteredRecords.length);

  return (
    <div className="section-wrapper bg-white p-0 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Shortage queue</h2>
          <p className="text-sm text-gray-500">
            Showing {filteredRecords.length.toLocaleString('en-US')} of {sortedRecords.length.toLocaleString('en-US')} customers forecasted to fall below required escrow balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <label className="text-xs uppercase tracking-wide text-gray-400">Filter</label>
          <select
            value={riskFilter}
            onChange={(event) => handleFilterChange(event.target.value as 'all' | 'high' | 'medium' | 'low')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
          >
            <option value="all">All risk levels</option>
            <option value="high">High risk (Shortage &gt; $4k)</option>
            <option value="medium">Medium risk ($2k - $4k)</option>
            <option value="low">Low risk (&lt; $2k)</option>
          </select>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 border border-gray-100 rounded-2xl bg-white px-4 py-4 shadow-sm">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            placeholder="Compose message for selected borrowers (e.g., reminder about escrow analysis call)."
            className="flex-1 min-h-[56px] rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim() || filteredRecords.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#d32f2f] text-white text-sm font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#b71c1c] transition-colors"
          >
            {isSending ? 'Sending…' : `Send to ${filteredRecords.length.toLocaleString('en-US')} borrowers`}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        {feedback ? (
          <div
            role="status"
            className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm shadow-sm ${feedbackToneStyles[feedback.tone]}`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-current/80">{renderFeedbackIcon(feedback.tone)}</span>
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="rounded-full p-1 text-current/60 hover:text-current"
              aria-label="Dismiss notification"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c62828]" />
            High &gt; $4k
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ef6c00]" />
            Medium $2k-4k
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#558b2f]" />
            Low &lt; $2k
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#ffebee]/70 text-[#b71c1c] uppercase tracking-wide text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Customer</th>
              <th className="px-6 py-3 text-left font-semibold">Loan #</th>
              <th className="px-6 py-3 text-left font-semibold">County</th>
              <th className="px-6 py-3 text-left font-semibold">Current Escrow</th>
              <th className="px-6 py-3 text-left font-semibold">Shortage</th>
              <th className="px-6 py-3 text-left font-semibold">Risk</th>
              <th className="px-6 py-3 text-left font-semibold">Next Tax Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No customers found for the selected filter.
                </td>
              </tr>
            ) : (
              visible.map((record) => {
                const risk = getRiskLevel(record['Forecasted Escrow Shortage']);
                return (
                  <tr
                    key={record['Loan Number']}
                    className="bg-white hover:bg-[#fff7f7] transition-colors cursor-pointer"
                    onClick={() => setSelected(record)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{record['Customer Name']}</span>
                        <span className="text-xs text-gray-500">{record['Contact']}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record['Loan Number']}</td>
                    <td className="px-6 py-4 text-gray-600">{record.County}</td>
                    <td className="px-6 py-4 text-gray-600">${record['Current Escrow Balance'].toLocaleString('en-US')}</td>
                    <td className="px-6 py-4 font-semibold text-[#c62828]">
                      ${record['Forecasted Escrow Shortage'].toLocaleString('en-US')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${riskStyles[risk.tone]}`}>
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record['Next Tax Pay Date']}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 px-6 py-4 border-t border-gray-100 bg-white text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {filteredRecords.length === 0 ? 'No results to display.' : `Showing ${firstRow.toLocaleString('en-US')}-${lastRow.toLocaleString('en-US')} of ${filteredRecords.length.toLocaleString('en-US')} borrowers`}
        </div>
        <div className="inline-flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:border-[#d32f2f]/40 hover:text-[#d32f2f]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:border-[#d32f2f]/40 hover:text-[#d32f2f]"
          >
            Next
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-[#ffebee]/40">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selected['Customer Name']}</h3>
                <p className="text-xs uppercase tracking-wide text-gray-500">Loan #{selected['Loan Number']}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-full text-gray-500 hover:text-[#d32f2f] hover:bg-[#ffebee]/60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <DetailRow label="Contact" value={selected['Contact']} />
                <DetailRow label="County" value={selected['County']} />
                <DetailRow label="Property Address" value={selected['Property Address']} />
                <DetailRow label="Current Balance" value={`$${selected['Current Balance'].toLocaleString('en-US')}`} />
                <DetailRow label="Escrow Balance" value={`$${selected['Current Escrow Balance'].toLocaleString('en-US')}`} />
              </div>
              <div className="space-y-2">
                <DetailRow label="Prev Tax" value={`$${selected['Prev Tax'].toLocaleString('en-US')}`} />
                <DetailRow label="Prev Insurance" value={`$${selected['Prev Insurance'].toLocaleString('en-US')}`} />
                <DetailRow label="Forecasted Tax" value={`$${selected['Forecasted Tax'].toLocaleString('en-US')}`} />
                <DetailRow label="Forecasted Insurance" value={`$${selected['Forecasted Insurance'].toLocaleString('en-US')}`} />
                <DetailRow
                  label="Forecasted Shortage"
                  value={`$${selected['Forecasted Escrow Shortage'].toLocaleString('en-US')}`}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              <p>Last interaction: {selected['Last Interaction Date']} • {selected['Last Interaction Type']}</p>
              <p className="mt-1 text-gray-600">{selected['Last Interaction Summary']}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string | number;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 break-words">{value}</span>
    </div>
  );
}

