'use client';

export default function LiabilityLossWidget({ totalLoss = 0 }: { totalLoss?: number }) {
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm flex justify-between items-center relative overflow-hidden group h-full">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
      
      <div className="relative z-10">
        <h3 className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Loss on Returns
        </h3>
        <p className="text-xs text-red-600 font-medium leading-tight max-w-[150px]">
          Amount lost due to returned sub-booked items.
        </p>
      </div>

      <div className="relative z-10 text-right">
        <span className="text-xl font-black text-red-600 drop-shadow-sm">-₹{totalLoss.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
