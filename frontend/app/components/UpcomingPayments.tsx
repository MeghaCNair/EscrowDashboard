import { EscrowData } from '../types/escrow';

interface UpcomingPaymentsProps {
  customers: EscrowData[];
}

export default function UpcomingPayments({ customers }: UpcomingPaymentsProps) {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return (
    <div className="section-wrapper p-6 sm:p-8 bg-white">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Upcoming Payments (Next 30 Days)</h2>
          <p className="text-sm text-gray-500">Monitor tax and insurance disbursements requiring funding</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-[#d32f2f]/40 hover:text-[#d32f2f] transition-colors">
            Download
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-[#d32f2f] rounded-lg shadow-md hover:bg-[#b71c1c] transition-colors">
            Add alert
          </button>
        </div>
      </div>
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
            {customers.length > 0 ? (
              customers.map((customer) => {
                const taxDate = new Date(customer["Next Tax Pay Date"]);
                const insDate = new Date(customer["Next Insurance Pay Date"]);
                const isTaxDue = taxDate >= today && taxDate <= nextMonth;
                const isInsDue = insDate >= today && insDate <= nextMonth;
                
                    const rowHighlight = isTaxDue && isInsDue ? 'bg-orange-50/60' : isTaxDue ? 'bg-[#ffebee]/70' : 'bg-green-50/70';

                    return (
                      <tr key={customer["Loan Number"]} className={`${rowHighlight} border-b border-gray-100/70 hover:bg-white transition-colors`}>
                        <td className="py-3 px-4 text-gray-900 font-medium">{customer["Customer Name"]}</td>
                        <td className="py-3 px-4 text-gray-600">{customer["Loan Number"]}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2">
                            {isTaxDue && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#d32f2f]/10 text-[#b71c1c] border border-[#d32f2f]/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d32f2f]"></span>
                                Tax
                              </span>
                            )}
                            {isInsDue && (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Insurance
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {isTaxDue && taxDate.toLocaleDateString()}
                          {isTaxDue && isInsDue && ', '}
                          {isInsDue && insDate.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {isTaxDue && `$${customer["Forecasted Tax"].toLocaleString()}`}
                          {isTaxDue && isInsDue && ' / '}
                          {isInsDue && `$${customer["Forecasted Insurance"].toLocaleString()}`}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{customer.County}</td>
                      </tr>
                    );
              })
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

