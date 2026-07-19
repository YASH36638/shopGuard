'use client';
import { useState } from 'react';
import { processReturn } from '@/app/actions/customer';

type Product = {
  id: string;
  name: string;
};

export default function ReturnForm({ customerId, products }: { customerId: string, products: Product[] }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [refundValue, setRefundValue] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity || quantity <= 0 || refundValue === '') return;
    
    setIsSaving(true);
    const res = await processReturn(customerId, null, productId, Number(quantity), Number(refundValue));
    setIsSaving(false);

    if (res.success) {
      setProductId('');
      setQuantity('');
      setRefundValue('');
      setIsOpen(false);
      alert('Return Processed Successfully!');
    } else {
      alert(res.error || 'Failed to process return');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-2 rounded transition-colors"
      >
        + Log Excess Material Return
      </button>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
      <h4 className="text-sm font-bold text-red-800 mb-3">Process Material Return</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select 
          value={productId} 
          onChange={e => setProductId(e.target.value)}
          className="flex-1 px-3 py-2 border border-red-200 rounded focus:outline-none text-sm"
          required
        >
          <option value="">Select Material...</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        
        <input 
          type="number" 
          value={quantity} 
          onChange={e => setQuantity(Number(e.target.value))} 
          placeholder="Quantity" 
          className="w-full px-3 py-2 border border-red-200 rounded focus:outline-none text-sm"
          required
        />
        
        <input 
          type="number" 
          value={refundValue} 
          onChange={e => setRefundValue(Number(e.target.value))} 
          placeholder="Total Refund ₹" 
          className="w-full px-3 py-2 border border-red-200 rounded focus:outline-none text-sm"
          required
        />
        
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={isSaving || !productId || !quantity || refundValue === ''}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 text-sm"
          >
            {isSaving ? 'Processing...' : 'Confirm'}
          </button>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="bg-white text-gray-500 font-bold py-2 px-3 rounded border border-gray-200 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
