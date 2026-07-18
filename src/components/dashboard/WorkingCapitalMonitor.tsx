'use client';
import { useState } from 'react';
import { updateWorkingCapital } from '@/app/actions/dashboard';

export default function WorkingCapitalMonitor({ workingCapital, protectedFloor }: { workingCapital: number, protectedFloor: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(workingCapital.toString());
  const [isSaving, setIsSaving] = useState(false);

  const isDanger = workingCapital < protectedFloor;

  const handleSave = async () => {
    const amount = Number(editValue);
    if (!isNaN(amount)) {
      setIsSaving(true);
      await updateWorkingCapital(amount);
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-sm border h-full flex flex-col ${isDanger ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDanger ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Working Capital</h2>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded"
        >
          {isEditing ? 'CANCEL' : 'EDIT'}
        </button>
      </div>
      
      {isEditing ? (
        <div className="mt-2 flex gap-2">
          <input 
            type="number" 
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-lg font-bold"
          />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 text-white font-bold px-3 rounded"
          >
            {isSaving ? '...' : 'SAVE'}
          </button>
        </div>
      ) : (
        <div className={`text-3xl font-bold mt-2 ${isDanger ? 'text-red-600' : 'text-gray-800'}`}>
          ₹{workingCapital.toLocaleString('en-IN')}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4 text-sm mt-auto">
        <span className="text-gray-500">Protected Floor</span>
        <span className="font-medium">₹{protectedFloor.toLocaleString('en-IN')}</span>
      </div>
      
      {isDanger && (
        <div className="mt-3 text-xs font-semibold text-red-600 bg-red-100 px-3 py-2 rounded">
          ALERT: Capital has breached the protected floor limit!
        </div>
      )}
    </div>
  );
}
