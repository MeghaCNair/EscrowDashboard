interface InteractionTypesProps {
  interactionTypes: Record<string, number>;
  totalCustomers: number;
}

export default function InteractionTypes({ interactionTypes, totalCustomers }: InteractionTypesProps) {
  const totalInteractions = Object.values(interactionTypes).reduce((sum, value) => sum + value, 0);

  return (
    <div className="section-wrapper p-6 sm:p-8 bg-white/80">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Interaction Types</h2>
          <p className="text-sm text-gray-500">Channels used in the last 90 days</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white text-xs font-medium text-gray-500 border border-gray-200">
          {totalInteractions.toLocaleString()} touchpoints
        </span>
      </div>
      <div className="space-y-4">
        {Object.entries(interactionTypes)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => {
            const percentage = totalCustomers ? (count / totalCustomers) * 100 : 0;
            return (
              <div key={type} className="flex items-center justify-between bg-white/70 border border-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ffebee] rounded-full flex items-center justify-center shadow-inner">
                    <svg className="w-5 h-5 text-[#d32f2f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{type}</p>
                    <p className="text-xs text-gray-500">{Math.round((count / totalInteractions) * 100)}% of recent outreach</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-28 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#d32f2f] to-[#f06292]"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">{count}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

