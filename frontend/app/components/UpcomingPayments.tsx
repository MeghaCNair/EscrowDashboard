'use client';

import { useEffect, useMemo, useState } from 'react';
import { EscrowData } from '../types/escrow';

interface UpcomingPaymentsProps {
  customers: EscrowData[];
}

interface PaymentRow {
  record: EscrowData;
  isTaxDue: boolean;
  isInsDue: boolean;
  taxDateLabel: string | null;
  insDateLabel: string | null;
  taxAmount: number | null;
  insAmount: number | null;
  rowHighlight: string;
  paymentTypes: string[];
  dueDates: string[];
  amountValues: number[];
}

type BannerTone = 'success' | 'info' | 'warning' | 'error';

interface BannerState {
  tone: BannerTone;
  message: string;
}

const toneStyles: Record<BannerTone, string> = {
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-[#bbdefb] bg-[#e3f2fd] text-[#0d47a1]',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

const csvEscape = (value: string | number | null | undefined) => {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export default function UpcomingPayments({ customers }: UpcomingPaymentsProps) {
  const [banner, setBanner] = useState<BannerState | null>(null);

  useEffect(() => {
    if (!banner) return;
    const timeout = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [banner]);

  const today = useMemo(() => new Date(), []);
  const nextMonth = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }, []);

  const rows: PaymentRow[] = useMemo(() => {
    const results: PaymentRow[] = [];

    customers.forEach((customer) => {
      const taxDate = new Date(customer['Next Tax Pay Date']);
      const insDate = new Date(customer['Next Insurance Pay Date']);
      const taxValid = !Number.isNaN(taxDate.getTime());
      const insValid = !Number.isNaN(insDate.getTime());
      const isTaxDue = taxValid && taxDate >= today && taxDate <= nextMonth;
      const isInsDue = insValid && insDate >= today && insDate <= nextMonth;

      const paymentTypes: string[] = [];
      const dueDates: string[] = [];
      const amountValues: number[] = [];

      if (isTaxDue) {
        paymentTypes.push('Tax');
        dueDates.push(taxDate.toLocaleDateString());
        amountValues.push(customer['Forecasted Tax']);
      }
      if (isInsDue) {
        paymentTypes.push('Insurance');
        dueDates.push(insDate.toLocaleDateString());
        amountValues.push(customer['Forecasted Insurance']);
      }

      const rowHighlight = isTaxDue && isInsDue
        ? 'bg-orange-50/60'
        : isTaxDue
          ? 'bg-[#ffebee]/70'
          : isInsDue
            ? 'bg-green-50/70'
            : 'bg-gray-50/40';

      results.push({
        record: customer,
        isTaxDue,
        isInsDue,
        taxDateLabel: isTaxDue ? taxDate.toLocaleDateString() : null,
        insDateLabel: isInsDue ? insDate.toLocaleDateString() : null,
        taxAmount: isTaxDue ? customer['Forecasted Tax'] : null,
        insAmount: isInsDue ? customer['Forecasted Insurance'] : null,
        rowHighlight,
        paymentTypes,
        dueDates,
        amountValues,
      });
    });

    return results;
  }, [customers, nextMonth, today]);

  const showBanner = (tone: BannerTone, message: string) => {
    setBanner({ tone, message });
  };

  const handleDownload = () => {
    if (rows.length === 0) {
      showBanner('info', 'No upcoming payments to export yet.');
      return;
    }

    const header = ['Customer', 'Loan Number', 'Payment Types', 'Due Dates', 'Amounts', 'County'];
    const lines = rows.map((row) => {
      const paymentLabels = row.paymentTypes.join(' / ') || 'N/A';
      const dueLabel = row.dueDates.join(' / ') || 'N/A';
      const amountLabel = row.amountValues
        .map((amount) => `$${amount.toFixed(2)}`)
        .join(' / ') || 'N/A';

      return [
        csvEscape(row.record['Customer Name']),
        csvEscape(row.record['Loan Number']),
        csvEscape(paymentLabels),
        csvEscape(dueLabel),
        csvEscape(amountLabel),
        csvEscape(row.record.County),
      ].join(',');
    });

    const csvContent = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `upcoming-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showBanner('success', 'Upcoming payments exported as a CSV download.');
  };

  const handleAlert = () => {
    const actionableRows = rows.filter((row) => row.isTaxDue || row.isInsDue);

    if (actionableRows.length === 0) {
      showBanner('info', 'No time-sensitive payments detected for alerting.');
      return;
    }

    const previewNames = actionableRows.slice(0, 2).map((row) => row.record['Customer Name']);
    const previewText = previewNames.length > 0 ? ` Preview: ${previewNames.join(', ')}${actionableRows.length > 2 ? '…' : ''}` : '';

    showBanner('success', `Alerts scheduled for ${actionableRows.length.toLocaleString('en-US')} borrowers.${previewText}`);
  };

  const renderIcon = (tone: BannerTone) => {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  return (
    <div className="section-wrapper p-6 sm:p-8 bg-white">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Upcoming Payments (Next 30 Days)</h2>
          <p className="text-sm text-gray-500">Monitor tax and insurance disbursements requiring funding</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#d32f2f]/40 hover:text-[#d32f2f] transition-colors"
          >
            Download
          </button>
          <button
            type="button"
            onClick={handleAlert}
            className="px-3 py-2 text-sm font-medium text-white bg-[#d32f2f] rounded-lg shadow-md hover:bg-[#b71c1c] transition-colors"
          >
            Add alert
          </button>
        </div>
      </div>

      {banner ? (
        <div
          role="status"
          className={`mb-5 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm shadow-sm ${toneStyles[banner.tone]}`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-current/80">{renderIcon(banner.tone)}</span>
            <span className="font-medium">{banner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="rounded-full p-1 text-current/60 hover:text-current"
            aria-label="Dismiss notification"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-200/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#ffefef] text-[#b71c1c] uppercase tracking-wide text-xs">
              <th className="text-left py-3 px-4 font-semibold">Customer</th>
              <th className="text-left py-3 px-4 font-semibold">Loan #</th>
              <th className="text-left py-3 px-4 font-semibold">Payment Type</th>
              <th className="text-left py-3 px-4 font-semibold">Due Date</th>
              <th className="text-right py-3 px-4 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 font-semibold">County</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.record['Loan Number']}
                  className={`${row.rowHighlight} border-b border-gray-100/70 hover:bg-white transition-colors`}
                >
                  <td className="py-3 px-4 text-gray-900 font-medium">{row.record['Customer Name']}</td>
                  <td className="py-3 px-4 text-gray-600">{row.record['Loan Number']}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {row.isTaxDue && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#d32f2f]/10 text-[#b71c1c] border border-[#d32f2f]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d32f2f]" />
                          Tax
                        </span>
                      )}
                      {row.isInsDue && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Insurance
                        </span>
                      )}
                      {!row.isTaxDue && !row.isInsDue ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Review
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {row.taxDateLabel}
                    {row.taxDateLabel && row.insDateLabel && ', '}
                    {row.insDateLabel}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {row.isTaxDue && row.taxAmount !== null ? `$${row.taxAmount.toLocaleString('en-US')}` : ''}
                    {row.isTaxDue && row.isInsDue ? ' / ' : ''}
                    {row.isInsDue && row.insAmount !== null ? `$${row.insAmount.toLocaleString('en-US')}` : ''}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{row.record.County}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No upcoming payments in the next 30 days
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

