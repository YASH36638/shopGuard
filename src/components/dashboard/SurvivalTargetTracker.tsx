'use client';
import { useState } from 'react';
import { updateStoreConfig } from '@/app/actions/dashboard';

export default function SurvivalTargetTracker({ currentProfit, initialTarget }: { currentProfit: number, initialTarget: number }) {
  const [target, setTarget] = useState(initialTarget);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialTarget.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const num = Number(editValue);
    if (!isNaN(num) && num > 0) {
      setIsSaving(true);
      setTarget(num);
      await updateStoreConfig({ survivalTarget: num });
      setIsEditing(false);
      setIsSaving(false);
    }
  };

  const current = currentProfit;
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  const getProgressBarColor = () => {
    if (percentage < 33) return 'bg-red-500';
    if (percentage < 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Today's Goal (Galla)</h2>
          <div className="text-3xl font-bold text-gray-800 mt-1">₹{current.toLocaleString('en-IN')}</div>
        </div>
        <div className="text-right">
          {isEditing ? (
            <div className="flex flex-col gap-1 items-end">
              <input 
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none"
              />
              <div className="flex gap-1">
                <button onClick={handleSave} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => setIsEditing(true)}>
              <div className="text-sm text-gray-500 group-hover:text-blue-500 flex items-center gap-1 justify-end">
                Target: ₹{target.toLocaleString('en-IN')}
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
              {remaining > 0 ? (
                <div className="text-sm font-medium text-amber-600">₹{remaining.toLocaleString('en-IN')} to go</div>
              ) : (
                <div className="text-sm font-medium text-emerald-600">Target Achieved!</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mt-auto">
        <div 
          className={`h-4 rounded-full transition-all duration-1000 ${getProgressBarColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
