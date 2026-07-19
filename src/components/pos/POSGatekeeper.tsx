'use client';
import { useState } from 'react';
import { createOrderAction } from '@/app/actions/order';
import { createProductAction } from '@/app/actions/product';
import { createCustomer } from '@/app/actions/customer';

const DEFAULT_INFLUENCERS = [
  { id: '1', name: 'Ramesh Mistri', type: 'Mason', rate: 5 },
  { id: '2', name: 'Suresh Contractor', type: 'Contractor', rate: 10 },
];

type ProductType = {
  id: string;
  name: string;
  type: string;
  phase: string;
  baseCost: number;
  standardMargin: number;
  hamaliRate: number;
};

type CustomerType = {
  id: string;
  name: string;
  phone: string | null;
};

type CartItem = ProductType & {
  cartId: string; 
  productId: string;
  quantity: number;
  cashRate: number;
};

export default function POSGatekeeper({ initialProducts = [], initialCustomers = [] }: { initialProducts: ProductType[], initialCustomers: CustomerType[] }) {
  const [catalog, setCatalog] = useState<ProductType[]>(initialProducts);
  const [customers, setCustomers] = useState<CustomerType[]>(initialCustomers);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID_CASH' | 'PAID_UPI' | 'ADVANCE_WALLET' | 'CREDIT'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Influencer State
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string>('');
  const [customInfluencer, setCustomInfluencer] = useState({ name: '', type: 'Mason', rate: 0 });
  const [isCustomInfluencer, setIsCustomInfluencer] = useState(false);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // New Custom Item State for the Catalog
  const [showCustomItemForm, setShowCustomItemForm] = useState(false);
  const [newCustomProduct, setNewCustomProduct] = useState({
    name: 'New Custom Material',
    baseCost: 0,
    standardMargin: 0,
    hamaliRate: 0,
    type: 'INVENTORY',
    phase: 'DURING'
  });

  const activeInfluencer = isCustomInfluencer 
    ? { id: 'custom', ...customInfluencer }
    : DEFAULT_INFLUENCERS.find(i => i.id === selectedInfluencerId) || null;
  
  const addToCart = (product: ProductType) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        cartId: Math.random().toString(36).substr(2, 9),
        productId: product.id, 
        ...product,
        quantity: 1,
        cashRate: product.baseCost + product.standardMargin + product.hamaliRate
      }];
    });
  };

  const handleSaveCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setIsCreatingCustomer(true);
    const res = await createCustomer(newCustomer.name, newCustomer.phone || null);
    setIsCreatingCustomer(false);
    if (res.success && res.customer) {
      setCustomers(prev => [...prev, res.customer!]);
      setSelectedCustomerId(res.customer!.id);
      setShowNewCustomer(false);
    } else {
      alert("Error saving customer.");
    }
  };

  const saveCustomItemToCatalog = async () => {
    if (!newCustomProduct.name.trim()) return;
    setIsCreatingProduct(true);
    
    const res = await createProductAction({
      name: newCustomProduct.name,
      type: newCustomProduct.type,
      phase: newCustomProduct.phase,
      baseCost: Number(newCustomProduct.baseCost),
      standardMargin: Number(newCustomProduct.standardMargin),
      hamaliRate: Number(newCustomProduct.hamaliRate)
    });

    setIsCreatingProduct(false);

    if (res.success && res.product) {
      setCatalog(prev => [...prev, res.product!]);
      addToCart(res.product!); // Automatically add to cart after creation
      setShowCustomItemForm(false);
    } else {
      alert("Failed to save custom product to catalog.");
    }
  };

  const updateCartItem = (cartId: string, field: keyof CartItem, value: any) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const updated = { ...item, [field]: value };
        updated.cashRate = updated.baseCost + updated.standardMargin + updated.hamaliRate;
        return updated;
      }
      return item;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  // Two-Tier Pricer Logic
  const calculateTotals = () => {
    let standardLedgerTotal = 0;
    let spotCashTotal = 0;
    let totalHamali = 0;
    let totalMargin = 0;
    let totalFreight = 0;
    let influencerCommission = 0;
    let revenueDuring = 0;
    let revenueAfter = 0;
    let profitDuring = 0;
    let profitAfter = 0;

    cart.forEach(item => {
      const q = item.quantity || 0;
      const itemBase = (item.baseCost || 0) * q;
      const itemMargin = (item.standardMargin || 0) * q;
      const itemHamali = (item.hamaliRate || 0) * q;
      const itemFreightCost = item.type === 'DIRECT_INDENT' ? 500 : 0; 
      
      const commission = activeInfluencer ? ((activeInfluencer.rate || 0) * q) : 0;
      influencerCommission += commission;

      const allInCost = itemBase + itemHamali + itemFreightCost + commission; 
      
      const ledgerRate = allInCost + itemMargin + (itemBase * 0.05); 
      const cashRate = allInCost + itemMargin;

      standardLedgerTotal += ledgerRate;
      spotCashTotal += cashRate;
      totalHamali += itemHamali;
      totalMargin += itemMargin;
      totalFreight += itemFreightCost;

      if (item.phase === 'DURING') {
        revenueDuring += cashRate;
        profitDuring += itemMargin;
      } else {
        revenueAfter += cashRate;
        profitAfter += itemMargin;
      }
    });

    return { standardLedgerTotal, spotCashTotal, totalHamali, totalMargin, totalFreight, cashDiscount: standardLedgerTotal - spotCashTotal, influencerCommission, revenueDuring, revenueAfter, profitDuring, profitAfter };
  };

  const totals = calculateTotals();

  const handleDispatch = async () => {
    setIsSaving(true);
    
    // Map cart items for DB
    const items = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      baseCost: item.baseCost,
      standardMargin: item.standardMargin,
      hamaliRate: item.hamaliRate,
      cashRate: item.cashRate,
      phase: item.phase,
    }));

    const res = await createOrderAction({
      customerId: selectedCustomerId || undefined,
      totalAmount: totals.spotCashTotal,
      grossProfit: totals.totalMargin,
      hamaliCollected: totals.totalHamali,
      freightCollected: totals.totalFreight,
      revenueDuring: totals.revenueDuring,
      revenueAfter: totals.revenueAfter,
      profitDuring: totals.profitDuring,
      profitAfter: totals.profitAfter,
      paymentMethod: paymentStatus.replace('PAID_', '').replace('ADVANCE_WALLET', 'ADVANCE'),
      items: items
    });
    
    setIsSaving(false);

    if (res.success) {
      if (activeInfluencer && cart.length > 0 && activeInfluencer.rate > 0) {
        setPayoutAmount(totals.influencerCommission);
        setShowPayoutModal(true);
      } else {
        alert("Order Dispatched Successfully & Saved to Ledger!");
        resetPOS();
      }
    } else {
      alert("Error saving order!");
    }
  };

  const handleCompletePayout = () => {
    setShowPayoutModal(false);
    alert("Payout Complete & Order Saved to Ledger!");
    resetPOS();
  };

  const resetPOS = () => {
    setCart([]);
    setPaymentStatus('PENDING');
    setSelectedCustomerId('');
    setSelectedInfluencerId('');
    setIsCustomInfluencer(false);
    setCustomInfluencer({ name: '', type: 'Mason', rate: 0 });
  };

  const filteredProducts = catalog.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full relative">
      
      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center rounded-xl backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-8 border-t-blue-500">
            <h2 className="text-xl font-black text-gray-800 mb-2">Instant Commission Cut</h2>
            <p className="text-sm text-gray-500 mb-6">Payout for {activeInfluencer?.name}</p>
            
            <div className="text-4xl font-black text-blue-600 mb-6">
              ₹{payoutAmount}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-xl mb-6">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
              <p className="text-xs font-bold text-gray-500 mt-2 tracking-wider">SCAN UPI TO PAYOUT</p>
            </div>
            
            <button 
              onClick={handleCompletePayout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all"
            >
              Confirm Paid & Close Order
            </button>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">New Bill (POS)</h2>
          <p className="text-xs text-gray-500">Create bill & sync to Khata</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Customer Selector / Editor */}
          <div className="flex flex-col gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Select Customer:</label>
              <select 
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:ring-emerald-500"
                value={showNewCustomer ? 'new' : selectedCustomerId}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setShowNewCustomer(true);
                    setSelectedCustomerId('');
                  } else {
                    setShowNewCustomer(false);
                    setSelectedCustomerId(e.target.value);
                  }
                }}
              >
                <option value="">Walk-in (Unregistered)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="new">+ Add New Customer</option>
              </select>
            </div>

            {showNewCustomer && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-32 text-xs border border-gray-300 rounded px-2 py-1"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                />
                <input 
                  type="text" 
                  placeholder="Phone" 
                  className="w-24 text-xs border border-gray-300 rounded px-2 py-1"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                />
                <button 
                  onClick={handleSaveCustomer}
                  disabled={isCreatingCustomer}
                  className="bg-emerald-600 text-white text-xs px-2 rounded font-bold"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Influencer Selector / Editor */}
          <div className="flex flex-col gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Add Mistri/Contractor:</label>
              <select 
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:ring-emerald-500"
                value={isCustomInfluencer ? 'custom' : selectedInfluencerId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setIsCustomInfluencer(true);
                    setSelectedInfluencerId('');
                  } else {
                    setIsCustomInfluencer(false);
                    setSelectedInfluencerId(val);
                  }
                }}
              >
                <option value="">None (Direct Walk-in)</option>
                {DEFAULT_INFLUENCERS.map(inf => (
                  <option key={inf.id} value={inf.id}>{inf.name} ({inf.type})</option>
                ))}
                <option value="custom">+ Add Custom Contractor</option>
              </select>
            </div>

            {isCustomInfluencer && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-32 text-xs border border-gray-300 rounded px-2 py-1"
                  value={customInfluencer.name}
                  onChange={e => setCustomInfluencer(p => ({ ...p, name: e.target.value }))}
                />
                <input 
                  type="number" 
                  placeholder="₹/item" 
                  className="w-20 text-xs border border-gray-300 rounded px-2 py-1"
                  value={customInfluencer.rate || ''}
                  onChange={e => setCustomInfluencer(p => ({ ...p, rate: Number(e.target.value) }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Product Selection */}
        <div className="lg:w-1/3 p-4 border-r border-gray-200 flex flex-col min-h-0">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Items List</h3>
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button 
                onClick={() => setShowCustomItemForm(!showCustomItemForm)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-2 rounded-lg text-sm transition-colors border border-gray-200 whitespace-nowrap"
              >
                {showCustomItemForm ? 'Cancel' : '+ New Item'}
              </button>
            </div>
            
            {showCustomItemForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 shadow-inner">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Save New Item to Catalog</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Item Name" 
                      className="w-2/3 text-sm border border-gray-300 rounded px-2 py-1.5"
                      value={newCustomProduct.name}
                      onChange={e => setNewCustomProduct(p => ({ ...p, name: e.target.value }))}
                    />
                    <select
                      className="w-1/3 text-sm border border-gray-300 rounded px-2 py-1.5 bg-white"
                      value={newCustomProduct.phase}
                      onChange={e => setNewCustomProduct(p => ({ ...p, phase: e.target.value }))}
                    >
                      <option value="DURING">During Const.</option>
                      <option value="AFTER">After Const.</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="number" 
                      placeholder="Base ₹" 
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                      value={newCustomProduct.baseCost || ''}
                      onChange={e => setNewCustomProduct(p => ({ ...p, baseCost: Number(e.target.value) }))}
                    />
                    <input 
                      type="number" 
                      placeholder="Margin ₹" 
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                      value={newCustomProduct.standardMargin || ''}
                      onChange={e => setNewCustomProduct(p => ({ ...p, standardMargin: Number(e.target.value) }))}
                    />
                    <input 
                      type="number" 
                      placeholder="Hamali ₹" 
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                      value={newCustomProduct.hamaliRate || ''}
                      onChange={e => setNewCustomProduct(p => ({ ...p, hamaliRate: Number(e.target.value) }))}
                    />
                  </div>
                  <button 
                    onClick={saveCustomItemToCatalog}
                    disabled={isCreatingProduct || !newCustomProduct.name.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded transition-colors mt-1"
                  >
                    {isCreatingProduct ? 'Saving...' : 'Save & Add to Cart'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 max-h-64 lg:max-h-none">
            {filteredProducts.map(p => (
              <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors relative group bg-white shadow-sm"
              >
                <div className="font-bold text-gray-800 text-sm">{p.name}</div>
                <div className="text-xs text-gray-500 mt-1">Def. Base: ₹{p.baseCost} | Margin: ₹{p.standardMargin}</div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && !showCustomItemForm && (
              <div className="text-center py-4 text-gray-400 text-sm">No products found in database.</div>
            )}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="flex-1 flex flex-col bg-gray-50 min-h-0">
          <div className="flex-1 p-4 overflow-y-auto max-h-96 lg:max-h-none">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Editable Cart Items</h3>
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10">Cart is empty. Select products to begin billing.</div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.cartId} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                    <button 
                      onClick={() => removeFromCart(item.cartId)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                    
                    <div className="mb-3 pr-8">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateCartItem(item.cartId, 'name', e.target.value)}
                        className="font-bold text-gray-800 text-sm w-full border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none bg-transparent py-1 transition-colors"
                        placeholder="Item Name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Quantity</label>
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(item.cartId, 'quantity', Number(e.target.value))}
                          className="w-full text-xs md:text-sm font-bold border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-1 bg-gray-50 px-1 md:px-2 rounded-t-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Base (₹)</label>
                        <input 
                          type="number" 
                          value={item.baseCost}
                          onChange={(e) => updateCartItem(item.cartId, 'baseCost', Number(e.target.value))}
                          className="w-full text-xs md:text-sm border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-1 bg-gray-50 px-1 md:px-2 rounded-t-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Margin (₹)</label>
                        <input 
                          type="number" 
                          value={item.standardMargin}
                          onChange={(e) => updateCartItem(item.cartId, 'standardMargin', Number(e.target.value))}
                          className="w-full text-xs md:text-sm border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-1 bg-gray-50 px-1 md:px-2 rounded-t-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Hamali (₹)</label>
                        <input 
                          type="number" 
                          value={item.hamaliRate}
                          onChange={(e) => updateCartItem(item.cartId, 'hamaliRate', Number(e.target.value))}
                          className="w-full text-xs md:text-sm border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-1 bg-gray-50 px-1 md:px-2 rounded-t-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Dispatch */}
          <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-br-xl shrink-0">
            {/* Two-Tier Pricer */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-sm line-through">Total Amount</span>
                <span className="text-sm line-through">₹{totals.standardLedgerTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-600">Cash Discount</span>
                <span className="text-sm font-bold text-emerald-600">-₹{totals.cashDiscount.toLocaleString('en-IN')}</span>
              </div>
              
              {/* Influencer Commission Visibility (Internal) */}
              {totals.influencerCommission > 0 && (
                <div className="flex justify-between items-center pt-2 text-blue-600 text-xs font-bold border-t border-gray-100">
                  <span>Embedded Commission ({activeInfluencer?.name})</span>
                  <span>₹{totals.influencerCommission.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              {/* All-In Landed Quote */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-lg font-black text-gray-800">Final Bill Amount</span>
                <span className="text-2xl font-black text-gray-900">₹{totals.spotCashTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Toggles */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button 
                onClick={() => setPaymentStatus('PAID_CASH')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border ${paymentStatus === 'PAID_CASH' ? 'bg-emerald-500 text-white border-emerald-600 shadow-inner' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                CASH
              </button>
              <button 
                onClick={() => setPaymentStatus('PAID_UPI')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border ${paymentStatus === 'PAID_UPI' ? 'bg-blue-500 text-white border-blue-600 shadow-inner' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                UPI
              </button>
              <button 
                onClick={() => setPaymentStatus('ADVANCE_WALLET')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border ${paymentStatus === 'ADVANCE_WALLET' ? 'bg-purple-500 text-white border-purple-600 shadow-inner' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                ADVANCE
              </button>
              <button 
                onClick={() => setPaymentStatus('CREDIT')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border ${paymentStatus === 'CREDIT' ? 'bg-red-500 text-white border-red-600 shadow-inner' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                UDHAR
              </button>
            </div>

            {/* Dispatch Gatekeeper Lock */}
            <button 
              onClick={handleDispatch}
              disabled={paymentStatus === 'PENDING' || cart.length === 0 || isSaving}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
                paymentStatus === 'PENDING' || cart.length === 0 || isSaving
                ? 'bg-red-500 text-white opacity-50 cursor-not-allowed' 
                : paymentStatus === 'CREDIT'
                ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
              }`}
            >
              {isSaving ? 'SAVING ORDER...' : (paymentStatus === 'PENDING' || cart.length === 0) ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  LOCKED: PENDING PAYMENT
                </>
              ) : paymentStatus === 'CREDIT' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  WARNING: DISPATCH ON CREDIT
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  SAVE BILL & PRINT
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
