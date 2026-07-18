export default function LogisticsOffsetWidget({ hamaliCollected, freightCollected }: { hamaliCollected: number, freightCollected: number }) {
  const targetOffset = 1730; // Roughly 45,000 / 26 days
  const total = hamaliCollected + freightCollected;
  const percentage = Math.min((total / targetOffset) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Labor & Freight Offset</h2>
      
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Hamali Collected</div>
          <div className="text-lg font-bold text-gray-800">₹{hamaliCollected.toLocaleString('en-IN')}</div>
        </div>
        <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Freight Collected</div>
          <div className="text-lg font-bold text-gray-800">₹{freightCollected.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 font-medium">Total: ₹{total.toLocaleString('en-IN')}</span>
          <span className="text-gray-500">Daily Target: ₹{targetOffset.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
