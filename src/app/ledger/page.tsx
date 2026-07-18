import prisma from '@/lib/prisma';
import Link from 'next/link';
import { settleCreditOrder } from '@/app/actions/order';

export default async function LedgerPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Group by Month-Year (e.g., "July 2026")
  const groupedOrders: Record<string, typeof orders> = {};
  
  orders.forEach(order => {
    const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(order.createdAt);
    if (!groupedOrders[monthYear]) {
      groupedOrders[monthYear] = [];
    }
    groupedOrders[monthYear].push(order);
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              Analysis Sheet
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1 ml-11">Detailed month-by-month financial ledger and profit analysis.</p>
          </div>
        </header>

        {Object.keys(groupedOrders).length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center text-gray-500 border border-gray-200">
            No orders found. Dispatch an order from the POS to see it here.
          </div>
        ) : (
          Object.keys(groupedOrders).map(monthYear => {
            const monthOrders = groupedOrders[monthYear];
            const totalRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            const totalProfit = monthOrders.reduce((sum, o) => sum + o.grossProfit, 0);

            return (
              <section key={monthYear} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">{monthYear}</h2>
                  <div className="text-sm text-gray-500 font-semibold">{monthOrders.length} Records</div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Date/Time</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Order ID</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Rev (Total)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Rev (During)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Rev (After)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Profit (Total)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Profit (During)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Profit (After)</th>
                        <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Method</th>
                        <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Status</th>
                        <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthOrders.map((order, index) => (
                        <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600 border-r border-gray-100 font-mono">
                            {new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-mono text-gray-400 border-r border-gray-100">
                            {order.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-gray-900 text-right border-r border-gray-100">
                            {order.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-gray-700 text-right border-r border-gray-100">
                            {(order.revenueDuring || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-gray-700 text-right border-r border-gray-100">
                            {(order.revenueAfter || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-emerald-600 text-right border-r border-gray-100">
                            {order.grossProfit.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-emerald-500 text-right border-r border-gray-100">
                            {(order.profitDuring || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-emerald-500 text-right border-r border-gray-100">
                            {(order.profitAfter || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-center border-r border-gray-100">
                            <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-sm uppercase ${
                              order.paymentMethod === 'CASH' ? 'bg-emerald-100 text-emerald-800' : 
                              order.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-800' : 
                              order.paymentMethod === 'CREDIT' ? 'bg-red-100 text-red-800 border border-red-200' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-center border-r border-gray-100">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{order.status.replace('_', ' ')}</span>
                          </td>
                          <td className="px-4 py-1 whitespace-nowrap text-center">
                            {order.paymentMethod === 'CREDIT' ? (
                              <form action={settleCreditOrder} className="flex justify-center gap-1">
                                <input type="hidden" name="orderId" value={order.id} />
                                <button type="submit" name="paymentMethod" value="CASH" className="text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2 rounded-sm transition-colors">
                                  PAID (CASH)
                                </button>
                                <button type="submit" name="paymentMethod" value="UPI" className="text-[9px] bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-sm transition-colors">
                                  PAID (UPI)
                                </button>
                              </form>
                            ) : (
                              <span className="text-[10px] text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* Summary Row for the month */}
                      <tr className="bg-gray-100 border-t-2 border-gray-300">
                        <td colSpan={2} className="px-4 py-3 text-right text-xs font-extrabold text-gray-800 uppercase tracking-widest border-r border-gray-300">
                          TOTAL ({monthYear})
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-black text-gray-900 border-r border-gray-300">
                          ₹{totalRevenue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-gray-700 border-r border-gray-300">
                          ₹{monthOrders.reduce((sum, o) => sum + (o.revenueDuring || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-gray-700 border-r border-gray-300">
                          ₹{monthOrders.reduce((sum, o) => sum + (o.revenueAfter || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-black text-emerald-700 border-r border-gray-300">
                          ₹{totalProfit.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-emerald-600 border-r border-gray-300">
                          ₹{monthOrders.reduce((sum, o) => sum + (o.profitDuring || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-emerald-600 border-r border-gray-300">
                          ₹{monthOrders.reduce((sum, o) => sum + (o.profitAfter || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td colSpan={3} className="bg-gray-100"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
