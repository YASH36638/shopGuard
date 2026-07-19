import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCustomerDetails } from '@/app/actions/customer';
import { getProducts } from '@/app/actions/product';
import ReturnForm from '@/components/customer/ReturnForm';

export default async function CustomerHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customer } = await getCustomerDetails(id);
  const products = await getProducts();

  if (!customer) return notFound();

  // Calculate stats
  let totalOrderValue = 0;
  let totalPaidValue = 0;

  customer.orders.forEach(order => {
    totalOrderValue += order.totalAmount;
    order.payments.forEach(p => {
      totalPaidValue += p.amount;
    });
  });

  const totalRefunds = customer.returns.reduce((sum, r) => sum + r.refundValue, 0);
  
  // Balance: (Order Values) - (Paid Values) - (Refunds)
  const pendingBalance = Math.max(0, totalOrderValue - totalPaidValue - totalRefunds);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/ledger" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{customer.name}</h1>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1 ml-11">
              Customer Hub & Pending Balances | {customer.phone || 'No Phone'}
            </p>
          </div>
          <div className="text-right bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Udhar Balance</div>
            <div className={`text-3xl font-black ${pendingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ₹{pendingBalance.toLocaleString('en-IN')}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">All Connected Bills ({customer.orders.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gross Amt</th>
                      <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customer.orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 font-mono">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-blue-600 hover:underline font-mono">
                          <Link href={`/order/${order.id}`}>{order.id.slice(0, 8)}</Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-gray-900 text-right">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${order.status === 'CREDIT' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {customer.orders.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-gray-400 italic text-sm">No orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                <h2 className="text-sm font-bold text-red-900 uppercase tracking-wider">Material Returns</h2>
              </div>
              <div className="p-4 space-y-4">
                <ReturnForm customerId={customer.id} products={products} />
                
                {customer.returns.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Return History</h3>
                    {customer.returns.map(ret => (
                      <div key={ret.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 border border-gray-100 rounded">
                        <div>
                          <div className="font-bold text-gray-800">{ret.quantity}x {ret.product?.name || 'Item'}</div>
                          <div className="text-[10px] text-gray-400">{new Date(ret.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="font-bold text-red-600">-₹{ret.refundValue.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Orders</span>
                  <span className="font-bold text-gray-800">₹{totalOrderValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Payments</span>
                  <span className="font-bold text-emerald-600">-₹{totalPaidValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Returns</span>
                  <span className="font-bold text-blue-600">-₹{totalRefunds.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-800 font-bold">Net Balance Due</span>
                  <span className="font-black text-red-600">₹{pendingBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
