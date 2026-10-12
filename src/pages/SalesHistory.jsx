import React, { useState, useEffect } from 'react';
import api from '../api';

export default function SalesHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // ALL, ONLINE, OFFLINE_COUNTER
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
       .then(res => setOrders(res.data.data || []))
       .catch(err => {
         console.error(err);
         alert('Failed to load orders: ' + (err.response?.data?.message || err.message));
       })
       .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filterType === 'ONLINE') return o.orderType === 'ONLINE';
    if (filterType === 'OFFLINE_COUNTER') return o.orderType === 'OFFLINE_COUNTER';
    return true;
  });

  const totalSalesAmount = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  if (loading && orders.length === 0) {
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
        <p style={{ fontWeight: '500', fontSize: '14px' }}>Loading sales and bills history...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#2C1810', fontWeight: '700', marginBottom: '4px' }}>
            Sales & Bills History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Complete audit log of all online customer orders and counter walk-in bills with items, quantities, and totals
          </p>
        </div>

        {/* Source Filters and Summary */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-alt)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setFilterType('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: filterType === 'ALL' ? '#FFFFFF' : 'transparent',
                color: filterType === 'ALL' ? '#2C1810' : 'var(--text-muted)',
                boxShadow: filterType === 'ALL' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilterType('ONLINE')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: filterType === 'ONLINE' ? '#FFFFFF' : 'transparent',
                color: filterType === 'ONLINE' ? '#2B5C8F' : 'var(--text-muted)',
                boxShadow: filterType === 'ONLINE' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Online ({orders.filter(o => o.orderType === 'ONLINE').length})
            </button>
            <button
              onClick={() => setFilterType('OFFLINE_COUNTER')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: filterType === 'OFFLINE_COUNTER' ? '#FFFFFF' : 'transparent',
                color: filterType === 'OFFLINE_COUNTER' ? '#2E6F40' : 'var(--text-muted)',
                boxShadow: filterType === 'OFFLINE_COUNTER' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Counter ({orders.filter(o => o.orderType === 'OFFLINE_COUNTER').length})
            </button>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#2C1810',
            boxShadow: 'var(--shadow-sm)'
          }}>
            Total: <span style={{ color: '#2E6F40' }}>₹{totalSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {filteredOrders.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          No bills or orders found in this category.
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-alt)',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--primary-dark)',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <th style={{ padding: '14px 18px' }}>Bill ID / Number</th>
                  <th style={{ padding: '14px 18px' }}>Date & Time</th>
                  <th style={{ padding: '14px 18px' }}>Source</th>
                  <th style={{ padding: '14px 18px' }}>Items & Quantities</th>
                  <th style={{ padding: '14px 18px' }}>Payment</th>
                  <th style={{ padding: '14px 18px' }}>Total Amount</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13.5px' }}>
                {filteredOrders.map((order, index) => {
                  const isOnline = order.orderType === 'ONLINE';
                  const dateStr = order.createdAt ? order.createdAt.replace('T', ' ').slice(0, 16) : '—';
                  const itemsCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 0), 0);

                  return (
                    <tr 
                      key={order.id}
                      style={{
                        borderBottom: index !== filteredOrders.length - 1 ? '1px solid #F3EDE2' : 'none',
                        backgroundColor: index % 2 === 1 ? '#FDFCFA' : '#FFFFFF'
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: '700', color: '#2C1810', fontSize: '13.5px' }}>
                          #{order.orderNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ID: {order.id} {order.tableNumber ? `· Table ${order.tableNumber}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: isOnline ? 'var(--status-blue-light)' : 'var(--accent-green-light)',
                          color: isOnline ? 'var(--status-blue)' : '#1B542B',
                          border: `1px solid ${isOnline ? '#C4D7E8' : 'var(--accent-green-border)'}`
                        }}>
                          {isOnline ? '🌐 Online' : '🧾 Counter'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', maxWidth: '320px' }}>
                        <div style={{ fontSize: '12.5px', color: '#2C1810', fontWeight: '500' }}>
                          {(order.items || []).map(it => `${it.menuItemName} (x${it.quantity})`).join(', ') || 'No items'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {itemsCount} item{itemsCount === 1 ? '' : 's'} total
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: '600', fontSize: '12.5px', color: '#4A2E1B' }}>
                          {order.paymentMethod || 'CASH'}
                        </span>
                        <div style={{ fontSize: '11px', color: order.paymentStatus === 'PAID' ? '#2E6F40' : '#A33B32', fontWeight: '600' }}>
                          {order.paymentStatus || 'PAID'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: '#2C1810', fontSize: '14px' }}>
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-alt)',
                            color: '#4A2E1B',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Receipt Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--border-color)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2C1810' }}>
                  Spice Garden Restaurant
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Customer Tax Invoice & Bill
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '2px 6px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '16px' }}>
              <div><b>Bill Number:</b> #{selectedOrder.orderNumber} (ID: {selectedOrder.id})</div>
              <div><b>Date:</b> {selectedOrder.createdAt ? selectedOrder.createdAt.replace('T', ' ').slice(0, 16) : '—'}</div>
              <div><b>Order Source:</b> {selectedOrder.orderType === 'ONLINE' ? 'Online Delivery' : 'Counter / POS'}</div>
              {selectedOrder.tableNumber && <div><b>Table:</b> {selectedOrder.tableNumber}</div>}
              <div><b>Payment:</b> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</div>
              {selectedOrder.customerName && <div><b>Customer:</b> {selectedOrder.customerName}</div>}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 0', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Items Ordered
              </div>
              {(selectedOrder.items || []).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                  <span>{item.menuItemName} x {item.quantity}</span>
                  <span style={{ fontWeight: '600' }}>₹{Number(item.subtotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>₹{Number(selectedOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(selectedOrder.discountAmount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E6F40' }}>
                  <span>Discount:</span>
                  <span>-₹{Number(selectedOrder.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Tax (5% GST):</span>
                <span>₹{Number(selectedOrder.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: '#2C1810', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                <span>Total Amount:</span>
                <span style={{ color: '#2E6F40' }}>₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#4A2E1B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--bg-alt)',
                  color: '#4A2E1B',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
