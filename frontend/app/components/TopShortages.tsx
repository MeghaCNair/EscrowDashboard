import { EscrowData } from '../types/escrow';

interface TopShortagesProps {
  customers: EscrowData[];
}

export default function TopShortages({ customers }: TopShortagesProps) {
  return (
    <div className="section-wrapper p-6 sm:p-8 bg-white/80">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Top 5 Customers by Shortage</h2>
          <p className="text-sm text-gray-500">Focus outreach on the largest projected shortages</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-[#d32f2f] bg-[#ffebee] rounded-full hover:bg-[#ffd6d6] transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {customers.map((customer, index) => (
          <div key={customer["Loan Number"]} className="flex items-center justify-between p-4 bg-white/70 border border-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#ffebee] rounded-full flex items-center justify-center text-[#d32f2f] font-semibold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{customer["Customer Name"]}</p>
                <p className="text-sm text-gray-600">Loan #{customer["Loan Number"]}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#d32f2f]">
                ${customer["Forecasted Escrow Shortage"].toLocaleString('en-US')}
              </p>
              <p className="text-xs text-gray-500">{customer.County}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

