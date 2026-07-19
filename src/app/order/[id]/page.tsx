import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PaymentForm from '@/components/order/PaymentForm';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: { product: true }
      },
      payments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!order) return notFound();

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, order.totalAmount - totalPaid);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Link href="/ledger" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              Order Details
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1 ml-11">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</div>
            <div className={`text-sm font-bold uppercase ${order.status === 'CREDIT' ? 'text-red-500' : 'text-emerald-500'}`}>
              {order.status}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Line Items</h2>
              </div>
              <div className="p-4">
                {order.items.length === 0 ? (
                  <div className="text-center text-gray-400 py-4 italic text-sm">No items logged (Legacy Order)</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-bold text-gray-500 pb-2">Product</th>
                        <th className="text-right text-xs font-bold text-gray-500 pb-2">Qty</th>
                        <th className="text-right text-xs font-bold text-gray-500 pb-2">Rate</th>
                        <th className="text-right text-xs font-bold text-gray-500 pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.map(item => (
                        <tr key={item.id}>
                          <td className="py-2 text-sm font-bold text-gray-800">{item.product?.name || 'Unknown'}</td>
                          <td className="py-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                          <td className="py-2 text-sm text-gray-600 text-right">₹{item.cashRate}</td>
                          <td className="py-2 text-sm font-bold text-gray-900 text-right">₹{(item.cashRate * item.quantity).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Payment History</h2>
                <div className="text-sm font-bold text-blue-800">Paid: ₹{totalPaid.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-4 space-y-3">
                {order.payments.length === 0 ? (
                  <div className="text-center text-gray-400 py-4 italic text-sm">No payments recorded.</div>
                ) : (
                  order.payments.map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border border-gray-100 rounded bg-gray-50">
                      <div>
                        <div className="font-bold text-gray-800">₹{payment.amount.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 uppercase">
                        {payment.method}
                      </div>
                    </div>
                  ))
                )}

                {balance > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Log Partial/Full Payment (Balance: ₹{balance})</h3>
                    <PaymentForm orderId={order.id} maxAmount={balance} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>
              {order.customer ? (
                <div>
                  <Link href={`/customer/${order.customer.id}`} className="text-lg font-bold text-blue-600 hover:underline block">
                    {order.customer.name}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">{order.customer.phone || 'No phone'}</div>
                </div>
              ) : (
                <div className="text-gray-500 italic">Walk-in Customer</div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Amount</span>
                  <span className="font-bold text-gray-800">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Balance Due</span>
                  <span className="font-bold text-red-600">₹{balance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
