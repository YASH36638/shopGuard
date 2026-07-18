'use client';
import { useState } from 'react';
import { updateSupplierDebt, updateSupplierActiveCredit } from '@/app/actions/dashboard';

export default function SupplierIcebox({ 
  supplier1Id, supplier1Debt, 
  supplier2Id, supplier2Credit 
}: { 
  supplier1Id: string, supplier1Debt: number, 
  supplier2Id: string, supplier2Credit: number 
}) {
  const tacticalBuffer = 100000; // Ring-fenced buffer
  
  const [isEditing1, setIsEditing1] = useState(false);
  const [editValue1, setEditValue1] = useState(supplier1Debt.toString());
  const [isSaving1, setIsSaving1] = useState(false);

  const [isEditing2, setIsEditing2] = useState(false);
  const [editValue2, setEditValue2] = useState(supplier2Credit.toString());
  const [isSaving2, setIsSaving2] = useState(false);

  const handleSave1 = async () => {
    const amount = Number(editValue1);
    if (!isNaN(amount)) {
      setIsSaving1(true);
      await updateSupplierDebt(supplier1Id, amount);
      setIsSaving1(false);
      setIsEditing1(false);
    }
  };

  const handleSave2 = async () => {
    const amount = Number(editValue2);
    if (!isNaN(amount)) {
      setIsSaving2(true);
      await updateSupplierActiveCredit(supplier2Id, amount);
      setIsSaving2(false);
      setIsEditing2(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">Supplier Debt Freeze Ledger</h2>

      <div className="space-y-6">
        {/* Supplier 1: Icebox */}
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">FROZEN</div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-blue-900">Supplier 1 (S1) Icebox</h3>
            
            {isEditing1 ? (
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={editValue1}
                  onChange={e => setEditValue1(e.target.value)}
                  className="w-32 border border-blue-300 rounded px-2 py-1 text-sm font-bold text-gray-800"
                />
                <button 
                  onClick={handleSave1}
                  disabled={isSaving1}
                  className="bg-blue-600 text-white text-xs font-bold px-3 rounded"
                >
                  {isSaving1 ? '...' : 'SAVE'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold text-blue-900">₹{supplier1Debt.toLocaleString('en-IN')}</div>
                <button 
                  onClick={() => setIsEditing1(true)}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-700 bg-blue-100 px-2 py-1 rounded border border-blue-200"
                >
                  EDIT
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-700 mb-4">Legacy debt is frozen. Only negotiated conditional settlements are allowed.</p>
          
          <div className="bg-white rounded p-3 border border-blue-100 flex justify-between items-center">
            <div className="text-xs font-semibold text-gray-500">Tactical Cooling Buffer</div>
            <div className="font-bold text-emerald-600">₹{tacticalBuffer.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Supplier 2: Active Line */}
        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">ACTIVE COD</div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-emerald-900">Supplier 2 (S2) Active Line</h3>
            
            {isEditing2 ? (
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={editValue2}
                  onChange={e => setEditValue2(e.target.value)}
                  className="w-32 border border-emerald-300 rounded px-2 py-1 text-sm font-bold text-gray-800"
                />
                <button 
                  onClick={handleSave2}
                  disabled={isSaving2}
                  className="bg-emerald-600 text-white text-xs font-bold px-3 rounded"
                >
                  {isSaving2 ? '...' : 'SAVE'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold text-emerald-900">₹{supplier2Credit.toLocaleString('en-IN')}</div>
                <button 
                  onClick={() => setIsEditing2(true)}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
                >
                  EDIT
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-emerald-700">Operating on strict Cash-On-Delivery. Earning ₹20/bag advantage.</p>
        </div>
      </div>
    </div>
  );
}
