import { RiskSegmentation } from '../types/escrow';

interface CustomerSegmentationProps {
  segmentation: RiskSegmentation;
}

export default function CustomerSegmentation({ segmentation }: CustomerSegmentationProps) {
  const { highRisk, mediumRisk, lowRisk, healthy } = segmentation;

  const riskCategories = [
    {
      label: 'High Risk',
      description: 'Shortage > $4,000',
      data: highRisk,
      gradient: 'from-[#d32f2f]/15 to-white',
      badgeColor: 'bg-[#d32f2f]',
      textColor: 'text-[#c62828]',
      icon: (
        <svg className="w-5 h-5 text-[#c62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      label: 'Medium Risk',
      description: 'Shortage $2,000 - $4,000',
      data: mediumRisk,
      gradient: 'from-[#f9a825]/18 to-white',
      badgeColor: 'bg-[#f9a825]',
      textColor: 'text-[#f57f17]',
      icon: (
        <svg className="w-5 h-5 text-[#f57f17]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Low Risk',
      description: 'Shortage < $2,000',
      data: lowRisk,
      gradient: 'from-[#26a69a]/15 to-white',
      badgeColor: 'bg-[#26a69a]',
      textColor: 'text-[#00897b]',
      icon: (
        <svg className="w-5 h-5 text-[#00897b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Healthy',
      description: 'No shortage or surplus',
      data: healthy,
      gradient: 'from-[#43a047]/15 to-white',
      badgeColor: 'bg-[#2e7d32]',
      textColor: 'text-[#2e7d32]',
      icon: (
        <svg className="w-5 h-5 text-[#2e7d32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="lg:col-span-2 section-wrapper p-6 sm:p-8 bg-white/70">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Segmentation by Risk</h2>
          <p className="text-sm text-gray-500">Breakdown of accounts requiring outreach based on projected shortages</p>
        </div>
        <button className="px-4 py-2 rounded-full bg-white text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:border-[#d32f2f]/40 hover:text-[#d32f2f] transition-colors">
          Export report
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {riskCategories.map((category) => {
          const totalAmount = category.data.reduce(
            (sum, d) => sum + (category.label === 'Healthy' 
              ? d["Forecasted Escrow Surplus"] 
              : d["Forecasted Escrow Shortage"]), 
            0
          );

          return (
            <div
              key={category.label}
              className={`relative overflow-hidden rounded-2xl border border-white shadow-sm hover:shadow-lg transition-shadow`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient}`}></div>
              <div className="relative flex items-center justify-between p-5 gap-6">
              <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={`w-12 h-12 ${category.badgeColor} rounded-xl flex items-center justify-center text-white font-semibold shadow-md`}>
                      {category.data.length}
                    </div>
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/70 border border-white shadow-sm">
                      {category.icon}
                    </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{category.label}</p>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${category.textColor}`}>
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

