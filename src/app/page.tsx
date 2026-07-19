import DailyScoreboard from '@/components/dashboard/DailyScoreboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ShopGuard OS</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Business Turnaround & Cash-Flow Management</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700">System Active</span>
          </div>
        </header>

        <section>
          <DailyScoreboard />
        </section>
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-gray-200 pt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
             <h2 className="text-xl font-bold text-gray-800 mb-2">New Bill (POS)</h2>
             <p className="text-gray-500 max-w-sm text-sm">Launch the POS to create a new bill and process sales.</p>
             <a href="/pos" className="mt-6 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm w-full">
               Launch POS
             </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
             <h2 className="text-xl font-bold text-gray-800 mb-2">All Bills (Khata)</h2>
             <p className="text-gray-500 max-w-sm text-sm">View the record of all bills and payments.</p>
             <a href="/ledger" className="mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full">
               View Khata
             </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
             <h2 className="text-xl font-bold text-gray-800 mb-2">Old Udhar (Recovery)</h2>
             <p className="text-gray-500 max-w-sm text-sm">Track pending items and old recoveries.</p>
             <a href="/legacy" className="mt-6 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors shadow-sm w-full">
               Pending Tracker
             </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
             <h2 className="text-xl font-bold text-gray-800 mb-2">Yearly Overview</h2>
             <p className="text-gray-500 max-w-sm text-sm">Track daily target completions and year-long performance analysis.</p>
             <a href="/overview" className="mt-6 bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors shadow-sm w-full">
               View Analytics
             </a>
          </div>
        </section>
      </div>
    </main>
  );
}
