import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getStoreConfig } from '@/app/actions/dashboard';

export default async function YearlyOverviewPage() {
  const storeConfig = await getStoreConfig();
  const SURVIVAL_TARGET = storeConfig.survivalTarget;
  const HAMALI_TARGET = 1730;
  const TOTAL_DAILY_TARGET = SURVIVAL_TARGET + HAMALI_TARGET;

  // Fetch all orders
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' }
  });

  // Group by day (YYYY-MM-DD format for keys)
  const groupedOrders: Record<string, typeof orders> = {};
  
  orders.forEach(order => {
    // Convert UTC to local effectively for grouping
    const dateStr = order.createdAt.toISOString().split('T')[0];
    if (!groupedOrders[dateStr]) {
      groupedOrders[dateStr] = [];
    }
    groupedOrders[dateStr].push(order);
  });

  const dailyStats = Object.keys(groupedOrders).map(dateStr => {
    const dayOrders = groupedOrders[dateStr];
    const grossProfit = dayOrders.reduce((sum, o) => sum + o.grossProfit, 0);
    const hamali = dayOrders.reduce((sum, o) => sum + o.hamaliCollected, 0);
    const freight = dayOrders.reduce((sum, o) => sum + o.freightCollected, 0);
    const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const isAchieved = grossProfit >= TOTAL_DAILY_TARGET;

    return {
      date: new Date(dateStr),
      dateStr,
      grossProfit,
      hamali,
      freight,
      revenue,
      isAchieved
    };
  }).reverse(); // Newest first

  const totalDays = dailyStats.length;
  const hitDays = dailyStats.filter(d => d.isAchieved).length;
  const winRate = totalDays > 0 ? ((hitDays / totalDays) * 100).toFixed(1) : 0;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              Yearly Performance Overview
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1 ml-11">
              Tracking Daily Target Completion (Goal: ₹{TOTAL_DAILY_TARGET.toLocaleString('en-IN')} Profit)
            </p>
          </div>
        </header>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-emerald-500">
            <div className="text-sm font-bold text-gray-500 uppercase">Target Hit Days</div>
            <div className="text-4xl font-black text-gray-900 mt-2">{hitDays} <span className="text-xl text-gray-400">/ {totalDays}</span></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500">
            <div className="text-sm font-bold text-gray-500 uppercase">Win Rate</div>
            <div className="text-4xl font-black text-gray-900 mt-2">{winRate}%</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-purple-500">
            <div className="text-sm font-bold text-gray-500 uppercase">Yearly Gross Margin</div>
            <div className="text-4xl font-black text-emerald-600 mt-2">
              ₹{dailyStats.reduce((sum, d) => sum + d.grossProfit, 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Daily Grid Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Daily Log</h2>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Hit</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span> Miss</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Gross Profit</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyStats.map(day => (
                  <tr key={day.dateStr} className={`hover:bg-gray-50 transition-colors ${day.isAchieved ? 'bg-emerald-50/20' : 'bg-red-50/20'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Intl.DateTimeFormat('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }).format(day.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      ₹{day.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900">
                      ₹{day.grossProfit.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {day.isAchieved ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          TARGET ACHIEVED
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
                          MISSED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {dailyStats.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                      No business days logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
