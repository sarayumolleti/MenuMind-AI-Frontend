import React, { useState, useEffect } from 'react';
import api from '../api';

export default function StaffView() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tableNumber, setTableNumber] = useState('T-1');
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  useEffect(() => {
    Promise.all([
      api.get('/menu-items'),
      api.get('/bills')
    ]).then(([menuRes, billsRes]) => {
      setItems(menuRes.data.data || []);
      setBills(billsRes.data.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchBills = () => api.get('/bills').then(res => setBills(res.data.data || [])).catch(console.error);

  const addToCart = (item) => {
    if (!item.isAvailable) return;
    setCart(prev => {
      const ex = prev.find(i => i.menuItemId === item.id);
      if (ex) return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.sellingPrice, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const generateBill = async (paymentMethod) => {
    if (cart.length === 0) return;
    setGenerating(true);
    try {
      const payload = {
        items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        paymentMethod,
        tableNumber: tableNumber || "T-1",
        customerName: customerName || "Walk-in Guest"
      };
      const res = await api.post('/bills', payload);
      setCart([]);
      fetchBills();
      if (res.data?.data) {
        setSelectedReceipt(res.data.data);
      }
    } catch (e) {
      alert('Error creating bill: ' + (e.response?.data?.message || e.message));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #EAE3D2',
          borderTopColor: '#4A2E1B',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '14px'
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: '500', fontSize: '14px' }}>Loading billing screen...</p>
      </div>
    );
  }

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#2C1810', fontWeight: '700', marginBottom: '4px' }}>
            Counter Billing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Take customer orders, accept cash or UPI payment, and generate itemized receipts
          </p>
        </div>
        
        {/* Table & Guest Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main)' }}>Table:</label>
            <input 
              type="text" 
              value={tableNumber} 
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T-1"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                width: '70px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-main)' }}>Guest:</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Guest Name"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                width: '120px',
                fontSize: '13px'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Quick Menu Selection Grid */}
        <div style={{ flex: '1 1 58%' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#2C1810', marginBottom: '14px' }}>
              Select Food Items
            </h2>
            {items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No items available.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                {items.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => addToCart(item)} 
                    style={{ 
                      cursor: item.isAvailable ? 'pointer' : 'not-allowed', 
                      border: '1px solid var(--border-color)', 
                      padding: '12px 10px', 
                      borderRadius: '8px', 
                      textAlign: 'center', 
                      backgroundColor: item.isAvailable ? '#FAF8F5' : '#EFEAE2',
                      opacity: item.isAvailable ? 1 : 0.55,
                      transition: 'all 0.15s ease',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: item.isVeg ? '#2E6F40' : '#A33B32', fontWeight: '700', marginBottom: '2px' }}>
                      {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#2C1810', marginBottom: '4px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#4A2E1B' }}>
                      ₹{item.sellingPrice}
                    </div>
                    {!item.isAvailable && (
                      <div style={{ color: '#A33B32', fontSize: '10.5px', fontWeight: '600', marginTop: '2px' }}>
                        Out of Stock
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Bill & Receipts Drawer */}
        <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Bill Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#2C1810' }}>
                Current Bill
              </h2>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#4A2E1B', backgroundColor: 'var(--bg-alt)', padding: '2px 8px', borderRadius: '4px' }}>
                Table: {tableNumber}
              </span>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-light)', fontSize: '13px' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>🧾</span>
                Bill is empty.<br/>Tap items to add them to this bill.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', marginBottom: '16px' }}>
                  {cart.map(c => (
                    <div key={c.menuItemId} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid #F5EFE6'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#2C1810' }}>{c.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>₹{c.price} x {c.quantity}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                          <button onClick={() => updateQuantity(c.menuItemId, -1)} style={{ padding: '1px 6px', border: 'none', background: 'var(--bg-alt)', cursor: 'pointer', fontWeight: '700' }}>-</button>
                          <span style={{ padding: '1px 6px', fontSize: '12px', fontWeight: '600' }}>{c.quantity}</span>
                          <button onClick={() => updateQuantity(c.menuItemId, 1)} style={{ padding: '1px 6px', border: 'none', background: 'var(--bg-alt)', cursor: 'pointer', fontWeight: '700' }}>+</button>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '13px', minWidth: '45px', textAlign: 'right' }}>
                          ₹{c.price * c.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--bg-alt)', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#2C1810' }}>
                    <span>Total (incl. tax):</span>
                    <span style={{ color: '#2E6F40' }}>₹{cartTotal}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    disabled={generating} 
                    onClick={() => generateBill('CASH')}
                    style={{
                      padding: '12px',
                      backgroundColor: '#4A2E1B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13.5px',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(74, 46, 27, 0.2)'
                    }}
                  >
                    💵 Cash Payment
                  </button>
                  <button 
                    disabled={generating} 
                    onClick={() => generateBill('UPI')}
                    style={{
                      padding: '12px',
                      backgroundColor: '#2E6F40',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13.5px',
                      cursor: generating ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(46, 111, 64, 0.2)'
                    }}
                  >
                    📱 UPI Payment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Printable Receipt View */}
          {selectedReceipt && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '2px dashed #C28E52',
              padding: '18px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#2C1810' }}>
                    {selectedReceipt.restaurantName || 'Spice Garden Restaurant'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedReceipt.invoiceNumber ? `Invoice #${selectedReceipt.invoiceNumber}` : `Bill #${selectedReceipt.orderNumber || selectedReceipt.id}`}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)} 
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)', padding: '2px 6px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '10px' }}>
                <div><b>Date:</b> {selectedReceipt.billedAt ? selectedReceipt.billedAt.slice(0, 16).replace('T', ' ') : 'Just now'}</div>
                <div><b>Table:</b> {selectedReceipt.tableNumber || 'Counter'} · <b>Guest:</b> {selectedReceipt.customerName || 'Walk-in'}</div>
                <div><b>Cashier:</b> {selectedReceipt.cashierStaffName || 'Staff'} · <b>Source:</b> Counter / POS</div>
                <div><b>Payment:</b> {selectedReceipt.paymentMethod} (PAID)</div>
              </div>

              {/* Items List */}
              <div style={{ borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1', padding: '8px 0', marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Items Ordered
                </div>
                {(selectedReceipt.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                    <span>{it.menuItemName || it.name} x {it.quantity}</span>
                    <span style={{ fontWeight: '600' }}>₹{Number(it.subtotal || (it.unitPrice * it.quantity) || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div style={{ fontSize: '12px', lineHeight: '1.5', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal:</span>
                  <span>₹{Number(selectedReceipt.subtotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Tax (5% GST):</span>
                  <span>₹{Number(selectedReceipt.gstAmount || selectedReceipt.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: '#2C1810', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#2E6F40' }}>₹{Number(selectedReceipt.grandTotal || selectedReceipt.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#4A2E1B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-alt)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: '#4A2E1B'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Recent Counter Bills History */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#2C1810', marginBottom: '12px' }}>
              Recent Counter Bills ({bills.length})
            </h2>

            {bills.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-light)', textAlign: 'center', padding: '10px 0' }}>
                No bills generated today.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {bills.map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => setSelectedReceipt(b)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-alt)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '12.5px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div>
                      <b style={{ color: '#2C1810' }}>#{b.invoiceNumber || b.orderNumber}</b>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {b.paymentMethod} · Table {b.tableNumber || 'Counter'} · {b.items?.length || 0} items
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <b style={{ color: '#2E6F40' }}>₹{Number(b.grandTotal || b.totalAmount || 0).toFixed(2)}</b>
                      <div style={{ fontSize: '10.5px', color: '#1B542B', fontWeight: '600' }}>PAID</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
