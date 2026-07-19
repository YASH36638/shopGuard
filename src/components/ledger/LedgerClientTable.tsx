'use client';
import { useState } from 'react';
import Link from 'next/link';

type OrderType = {
  id: string;
  totalAmount: number;
  revenueDuring: number;
  revenueAfter: number;
  grossProfit: number;
  profitDuring: number;
  profitAfter: number;
  paymentMethod: string | null;
  status: string;
  createdAt: Date;
  customer?: {
    id: string;
    name: string;
  } | null;
};

export default function LedgerClientTable({ groupedOrders }: { groupedOrders: Record<string, OrderType[]> }) {
  const [showMargins, setShowMargins] = useState(true);

  if (Object.keys(groupedOrders).length === 0) {
    return (
      <div className="bg-white p-10 rounded-xl shadow-sm text-center text-gray-500 border border-gray-200">
        No orders found. Dispatch an order from the POS to see it here.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowMargins(!showMargins)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${showMargins ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
        >
          {showMargins ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            </>
          )}
          {showMargins ? 'Hide Margins (Customer Mode)' : 'Margins Hidden'}
        </button>
      </div>

      {Object.keys(groupedOrders).map(monthYear => {
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
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Customer</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Rev (Total)</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Rev (During)</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Rev (After)</th>
                    {showMargins && (
                      <>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-emerald-600 uppercase tracking-wider border-r border-gray-200">Profit (Total)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-emerald-600 uppercase tracking-wider border-r border-gray-200">Profit (During)</th>
                        <th className="px-4 py-2 text-right text-[10px] font-bold text-emerald-600 uppercase tracking-wider border-r border-gray-200">Profit (After)</th>
                      </>
                    )}
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Method</th>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthOrders.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600 border-r border-gray-100 font-mono">
                        {new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline border-r border-gray-100">
                        <Link href={`/order/${order.id}`}>{order.id.slice(0, 8)}</Link>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs font-bold border-r border-gray-100">
                        {order.customer ? (
                          <Link href={`/customer/${order.customer.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                            {order.customer.name}
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">Walk-in</span>
                        )}
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
                      {showMargins && (
                        <>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-emerald-600 text-right border-r border-gray-100">
                            {order.grossProfit.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-emerald-500 text-right border-r border-gray-100">
                            {(order.profitDuring || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs font-bold text-emerald-500 text-right border-r border-gray-100">
                            {(order.profitAfter || 0).toLocaleString('en-IN')}
                          </td>
                        </>
                      )}
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
                    </tr>
                  ))}
                  {/* Summary Row for the month */}
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td colSpan={3} className="px-4 py-3 text-right text-xs font-extrabold text-gray-800 uppercase tracking-widest border-r border-gray-300">
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
                    {showMargins && (
                      <>
                        <td className="px-4 py-3 text-right text-sm font-black text-emerald-700 border-r border-gray-300">
                          ₹{totalProfit.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-emerald-600 border-r border-gray-300">
                          ₹{monthOrders.reduce((sum, o) => sum + (o.profitDuring || 0), 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-emerald-600 border-r border-gray-300">
                          ₹{monthOrders.reduce((sum, o) => sum + (o.profitAfter || 0), 0).toLocaleString('en-IN')}
                        </td>
                      </>
                    )}
                    <td colSpan={2} className="bg-gray-100"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
