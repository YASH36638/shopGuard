import SupplierIcebox from '@/components/legacy/SupplierIcebox';
import DripFeedDispatcher from '@/components/legacy/DripFeedDispatcher';
import Link from 'next/link';
import { getSupplier, getDripFeedStats } from '@/app/actions/dashboard';
import prisma from '@/lib/prisma';

export default async function LegacyPage() {
  const supplier1 = await getSupplier('Supplier 1');
  const supplier2 = await getSupplier('Supplier 2');
  const dripFeedStats = await getDripFeedStats();
  const config = await prisma.storeConfig.findUnique({ where: { id: 'singleton' } });

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              Legacy Liabilities Tracker
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1 ml-11">Manage frozen debts and track active drip-feed recoveries.</p>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SupplierIcebox 
            supplier1Id={supplier1.id} supplier1Debt={supplier1.legacyDebt} 
            supplier2Id={supplier2.id} supplier2Credit={supplier2.activeCredit} 
          />
          <DripFeedDispatcher 
            logs={dripFeedStats.logs} 
            initialBasePending={dripFeedStats.basePendingBags} 
            initialLegacyLoss={config?.legacyLoss || 0}
          />
        </section>
      </div>
    </main>
  );
}
