interface CountyDistributionProps {
  countyCounts: Record<string, number>;
  totalCustomers: number;
  riskBreakdown?: Record<
    string,
    {
      high: number;
      medium: number;
      low: number;
    }
  >;
}

export default function CountyDistribution({ countyCounts, totalCustomers, riskBreakdown }: CountyDistributionProps) {
  const sortedEntries = Object.entries(countyCounts).sort(([, a], [, b]) => b - a);

  return (
    <div className="section-wrapper p-6 sm:p-8 bg-white/75">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Distribution by County</h2>
          <p className="text-sm text-gray-500">Top locations driving current escrow workload</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#ffebee] text-[#d32f2f] text-xs font-medium">
          {sortedEntries.length} counties
        </span>
      </div>
      <div className="space-y-4">
        {sortedEntries.map(([county, count], index) => {
          const percentage = totalCustomers ? (count / totalCustomers) * 100 : 0;
          const risk = riskBreakdown?.[county];
          const totalForCounty = risk ? risk.high + risk.medium + risk.low : 0;
          const highPct = risk ? Math.round((risk.high / Math.max(1, totalForCounty)) * 100) : 0;
          const mediumPct = risk ? Math.round((risk.medium / Math.max(1, totalForCounty)) * 100) : 0;
          const lowPct = risk ? Math.round((risk.low / Math.max(1, totalForCounty)) * 100) : 0;
          const highWidth = risk ? (percentage * risk.high) / Math.max(1, totalForCounty) : 0;
          const mediumWidth = risk ? (percentage * risk.medium) / Math.max(1, totalForCounty) : 0;
          const lowWidth = risk ? (percentage * risk.low) / Math.max(1, totalForCounty) : 0;

          return (
            <div key={county} className="group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{index + 1}.</span>
                  <span className="text-sm font-medium text-gray-700">{county}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{Math.round(percentage)}%</span>
                  <span className="text-sm text-gray-600 font-medium">{count}</span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-200/70 overflow-hidden flex">
                {risk ? (
                  <>
                    <span
                      className="h-full bg-[#d32f2f] transition-all duration-300 group-hover:opacity-90"
                      style={{ width: `${highWidth}%` }}
                    />
                    <span
                      className="h-full bg-[#f9a825] transition-all duration-300 group-hover:opacity-90"
                      style={{ width: `${mediumWidth}%` }}
                    />
                    <span
                      className="h-full bg-[#558b2f] transition-all duration-300 group-hover:opacity-90"
                      style={{ width: `${lowWidth}%` }}
                    />
                  </>
                ) : (
                  <span
                    className="h-full bg-gradient-to-r from-[#d32f2f] via-[#f06292] to-[#ff8a80] transition-all duration-300 group-hover:opacity-90"
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
              {risk ? (
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#c62828]" />
                    High {highPct}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#f9a825]" />
                    Medium {mediumPct}%
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#558b2f]" />
                    Low {lowPct}%
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

