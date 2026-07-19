import prisma from '@/lib/prisma';
import Link from 'next/link';
import LedgerClientTable from '@/components/ledger/LedgerClientTable';

export default async function LedgerPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true
    },
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

        <LedgerClientTable groupedOrders={groupedOrders} />
      </div>
    </main>
  );
}
