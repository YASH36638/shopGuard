import POSGatekeeper from '@/components/pos/POSGatekeeper';
import Link from 'next/link';
import { getProducts } from '@/app/actions/product';
import { getCustomers } from '@/app/actions/customer';

export default async function POSPage() {
  const products = await getProducts();
  const customers = await getCustomers();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col h-screen">
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            POS & Dispatch
          </h1>
        </div>
        <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 text-sm font-bold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          STRICT NO CREDIT
        </div>
      </header>

      <section className="flex-1 min-h-0">
        <POSGatekeeper initialProducts={products} initialCustomers={customers} />
      </section>
    </main>
  );
}
