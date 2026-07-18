'use client';
import { useState } from 'react';
import { logDripFeedDispatch, updateStoreConfig } from '@/app/actions/dashboard';

type Log = {
  id: string;
  bags: number;
  rate: number;
  bookedRate: number;
  createdAt: Date;
};

export default function DripFeedDispatcher({ logs, initialBasePending, initialLegacyLoss = 0 }: { logs: Log[], initialBasePending: number, initialLegacyLoss?: number }) {
  const [dispatchAmount, setDispatchAmount] = useState('');
  const [rate, setRate] = useState('');
  const [bookedRate, setBookedRate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [basePending, setBasePending] = useState(initialBasePending);
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [editBaseValue, setEditBaseValue] = useState(initialBasePending.toString());

  const [isEditingLoss, setIsEditingLoss] = useState(false);
  const [legacyLoss, setLegacyLoss] = useState(initialLegacyLoss);
  const [editLossValue, setEditLossValue] = useState(initialLegacyLoss.toString());

  const totalDeducted = logs.reduce((sum, log) => sum + log.bags, 0);
  const pendingBags = Math.max(0, basePending - totalDeducted);

  const handleSaveBase = async () => {
    const num = Number(editBaseValue);
    if (!isNaN(num) && num >= 0) {
      setBasePending(num);
      await updateStoreConfig({ basePendingBags: num });
      setIsEditingBase(false);
    }
  };

  const handleSaveLoss = async () => {
    const num = Number(editLossValue);
    if (!isNaN(num) && num >= 0) {
      setLegacyLoss(num);
      await updateStoreConfig({ legacyLoss: num });
      setIsEditingLoss(false);
    }
  };

  const handleDispatch = async () => {
    const amount = parseInt(dispatchAmount);
    const sellRate = parseFloat(rate);
    const booked = parseFloat(bookedRate);
    
    if (!isNaN(amount) && !isNaN(sellRate) && !isNaN(booked) && amount > 0 && amount <= pendingBags) {
      setIsSaving(true);
      await logDripFeedDispatch(amount, sellRate, booked);
      
      setDispatchAmount('');
      setRate('');
      setBookedRate('');
      setIsSaving(false);
      alert(`Dispatched ${amount} bags. This is logged and any loss automatically deducted from Working Capital.`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Customer Cement Bookings</h2>
          <p className="text-sm text-gray-500">Drip-Feed Defusal Tracker</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pending Liability</div>
          
          {/* Base Pending Bags UI */}
          {isEditingBase ? (
            <div className="flex flex-col gap-1 items-end mb-2">
              <input 
                type="number"
                value={editBaseValue}
                onChange={e => setEditBaseValue(e.target.value)}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none"
                placeholder="Bags"
              />
              <div className="flex gap-1">
                <button onClick={handleSaveBase} className="text-[10px] bg-orange-500 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setIsEditingBase(false)} className="text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="group cursor-pointer mb-2" onClick={() => setIsEditingBase(true)}>
              <div className="text-2xl font-bold text-orange-500 group-hover:text-orange-600 flex items-center gap-1 justify-end">
                {pendingBags} Bags
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            </div>
          )}

          {/* Legacy Loss UI */}
          <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Legacy Defusal Loss</div>
          {isEditingLoss ? (
            <div className="flex flex-col gap-1 items-end">
              <input 
                type="number"
                value={editLossValue}
                onChange={e => setEditLossValue(e.target.value)}
                className="w-24 px-2 py-1 text-sm border border-red-200 rounded focus:outline-none text-red-600"
                placeholder="₹ Amount"
              />
              <div className="flex gap-1">
                <button onClick={handleSaveLoss} className="text-[10px] bg-red-500 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setIsEditingLoss(false)} className="text-[10px] bg-gray-200 text-gray-700 px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => setIsEditingLoss(true)}>
              <div className="text-sm font-bold text-red-500 group-hover:text-red-600 flex items-center gap-1 justify-end">
                ₹{legacyLoss.toLocaleString('en-IN')}
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
        <label className="block text-sm font-semibold text-orange-800 mb-2">Log Partial Dispatch (Drip-Feed)</label>
        <div className="flex flex-col gap-2 mb-2">
          <input 
            type="number" 
            value={dispatchAmount}
            onChange={(e) => setDispatchAmount(e.target.value)}
            placeholder="No. of bags" 
            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              value={bookedRate}
              onChange={(e) => setBookedRate(e.target.value)}
              placeholder="Booked Rate (₹)" 
              className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
            <input 
              type="number" 
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Sold Rate (₹)" 
              className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
          </div>
        </div>
        
        <button 
          onClick={handleDispatch}
          disabled={!dispatchAmount || !rate || !bookedRate || parseInt(dispatchAmount) <= 0 || parseInt(dispatchAmount) > pendingBags || isSaving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {isSaving ? 'Logging...' : 'Dispatch & Log Price'}
        </button>
      </div>

      <div className="flex-1 mt-2">
        <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Recent Dispatches (Price Tracking)</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {logs.length === 0 && <p className="text-xs text-gray-400 italic">No dispatches logged yet.</p>}
          {logs.map((log) => {
            const bRate = log.bookedRate || 0; 
            const profit = (log.rate - bRate) * log.bags;
            return (
              <div key={log.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                <div>
                  <div className="font-bold text-gray-700">{log.bags} bags</div>
                  <div className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">
                    <span className="text-gray-400">Booked:</span> ₹{bRate} | <span className="text-emerald-600">Sold:</span> ₹{log.rate}
                  </div>
                  {bRate > 0 && (
                    <div className={`text-[10px] font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      Net: {profit >= 0 ? '+' : ''}₹{profit}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
