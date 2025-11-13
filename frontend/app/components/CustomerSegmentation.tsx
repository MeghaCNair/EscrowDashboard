import { RiskSegmentation } from '../types/escrow';

interface CustomerSegmentationProps {
  segmentation: RiskSegmentation;
}

export default function CustomerSegmentation({ segmentation }: CustomerSegmentationProps) {
  const { highRisk, mediumRisk, lowRisk, healthy } = segmentation;

  const sumShortage = (records: typeof highRisk) =>
    records.reduce((total, record) => total + Math.max(0, record['Forecasted Escrow Shortage']), 0);

  const sumSurplus = (records: typeof healthy) =>
    records.reduce((total, record) => total + Math.max(0, record['Forecasted Escrow Surplus'] ?? 0), 0);

  const segments = [
    {
      key: 'high',
      title: 'High Risk',
      gradient: 'from-[#fde0e0] via-[#ffebee] to-white',
      badgeClass: 'bg-[#d32f2f] text-white shadow-[0_8px_18px_rgba(211,47,47,0.18)]',
      iconClass: 'bg-white/85 border border-white/70 text-[#c62828]',
      description: 'Shortage > $4,000',
      count: highRisk.length,
      amount: sumShortage(highRisk),
      amountLabel: 'Aggregate shortage',
      valueColor: 'text-[#c62828]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M4.93 19h14.14a1 1 0 00.87-1.5L12.87 4.5a1 1 0 00-1.74 0L4.06 17.5A1 1 0 004.93 19z" />
        </svg>
      ),
    },
    {
      key: 'medium',
      title: 'Medium Risk',
      gradient: 'from-[#ffe3ba] via-[#fff3e0] to-white',
      badgeClass: 'bg-[#fb8c00] text-white shadow-[0_8px_18px_rgba(251,140,0,0.18)]',
      iconClass: 'bg-white/85 border border-white/70 text-[#ef6c00]',
      description: 'Shortage $2,000 – $4,000',
      count: mediumRisk.length,
      amount: sumShortage(mediumRisk),
      amountLabel: 'Aggregate shortage',
      valueColor: 'text-[#ef6c00]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l2.5 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'low',
      title: 'Low Risk',
      gradient: 'from-[#e6f4ea] via-[#f4fbf5] to-white',
      badgeClass: 'bg-[#43a047] text-white shadow-[0_8px_18px_rgba(67,160,71,0.18)]',
      iconClass: 'bg-white/85 border border-white/70 text-[#2e7d32]',
      description: 'Shortage < $2,000',
      count: lowRisk.length,
      amount: sumShortage(lowRisk),
      amountLabel: 'Aggregate shortage',
      valueColor: 'text-[#2e7d32]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22a10 10 0 110-20 10 10 0 010 20z" />
        </svg>
      ),
    },
    {
      key: 'healthy',
      title: 'Healthy',
      gradient: 'from-[#d6f3ea] via-[#ebf9f3] to-white',
      badgeClass: 'bg-[#00796b] text-white shadow-[0_8px_18px_rgba(0,121,107,0.18)]',
      iconClass: 'bg-white/85 border border-white/70 text-[#00796b]',
      description: 'No shortage • positive cushion',
      count: healthy.length,
      amount: sumSurplus(healthy),
      amountLabel: 'Aggregate surplus',
      valueColor: 'text-[#00796b]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M12 22a10 10 0 110-20 10 10 0 010 20z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="lg:col-span-2 section-wrapper p-6 sm:p-8 bg-white/70 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Segmentation by Risk</h2>
          <p className="text-sm text-gray-500">Breakdown of accounts requiring outreach based on projected shortages</p>
        </div>
        <button className="px-4 py-2 rounded-full bg-white text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:border-[#d32f2f]/40 hover:text-[#d32f2f] transition-colors">
          Export report
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {segments.map((segment) => {
          const formattedValue = `$${segment.amount.toLocaleString('en-US')}`;

          return (
            <div
              key={segment.key}
              className="relative overflow-hidden rounded-2xl border border-white shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${segment.gradient}`}></div>
              <div className="relative flex items-center justify-between p-5 gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold ${segment.badgeClass}`}>
                      {segment.count.toLocaleString('en-US')}
                    </div>
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full shadow-sm ${segment.iconClass}`}>
                      {segment.icon}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{segment.title}</p>
                    <p className="text-sm text-gray-600">{segment.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${segment.valueColor}`}>{formattedValue}</p>
                  <p className="text-xs text-gray-500 mt-1">{segment.amountLabel}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

