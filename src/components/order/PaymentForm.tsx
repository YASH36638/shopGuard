'use client';
import { useState } from 'react';
import { processPayment } from '@/app/actions/order';

export default function PaymentForm({ orderId, maxAmount }: { orderId: string, maxAmount: number }) {
  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState('CASH');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || amount > maxAmount) return;
    
    setIsSaving(true);
    const res = await processPayment(orderId, Number(amount), method);
    setIsSaving(false);

    if (res.success) {
      setAmount('');
      alert('Payment Logged Successfully!');
    } else {
      alert(res.error || 'Failed to log payment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input 
        type="number" 
        value={amount} 
        onChange={e => setAmount(Number(e.target.value))} 
        max={maxAmount} 
        placeholder="Amount ₹" 
        className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <select 
        value={method} 
        onChange={e => setMethod(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="CASH">CASH</option>
        <option value="UPI">UPI</option>
        <option value="ADVANCE">ADVANCE WALLET</option>
      </select>
      <button 
        type="submit" 
        disabled={isSaving || !amount}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Log Payment'}
      </button>
    </form>
  );
}
