import React, { useState, useEffect } from 'react';
import api from '../api';

export default function CustomerView() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, VEG, NON_VEG

  // Customer Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    reviewText: '',
    menuItemId: '',
    customerName: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/menu-items'),
      api.get('/orders/my-orders')
    ]).then(([menuRes, orderRes]) => {
      setItems(menuRes.data.data || []);
      setOrders(orderRes.data.data || []);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

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

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const payload = {
        items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        paymentMethod: 'UPI'
      };
      await api.post('/orders', payload);
      setCart([]);
      alert('Order placed successfully! Preparing your food.');
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data || []);
    } catch (e) {
      alert('Error placing order: ' + (e.response?.data?.message || e.message));
    } finally {
      setPlacing(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const payload = {
        rating: Number(feedbackData.rating),
        reviewText: feedbackData.reviewText.trim(),
        menuItemId: feedbackData.menuItemId ? Number(feedbackData.menuItemId) : null,
        customerName: feedbackData.customerName.trim() || 'Guest Diner'
      };
      await api.post('/feedbacks', payload);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setShowFeedbackModal(false);
        setFeedbackData({ rating: 5, reviewText: '', menuItemId: '', customerName: '' });
      }, 1500);
    } catch (err) {
      alert('Error submitting feedback: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingFeedback(false);
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
        <p style={{ fontWeight: '500', fontSize: '14px' }}>Loading restaurant menu...</p>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    if (activeFilter === 'VEG') return item.isVeg;
    if (activeFilter === 'NON_VEG') return !item.isVeg;
    return true;
  });

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header and Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#2C1810', fontWeight: '700', marginBottom: '4px' }}>
            Restaurant Menu
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Choose your favorite dishes and place your order
          </p>
        </div>

        {/* Right buttons: Filters and Feedback */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowFeedbackModal(true)}
            style={{
              backgroundColor: '#4A2E1B',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(74, 46, 27, 0.2)'
            }}
          >
            <span>⭐</span> Give Feedback
          </button>

          {/* Dietary Filters */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-alt)', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setActiveFilter('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: activeFilter === 'ALL' ? '#FFFFFF' : 'transparent',
                color: activeFilter === 'ALL' ? '#2C1810' : 'var(--text-muted)',
                boxShadow: activeFilter === 'ALL' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              All Items
            </button>
            <button 
              onClick={() => setActiveFilter('VEG')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: activeFilter === 'VEG' ? '#FFFFFF' : 'transparent',
                color: activeFilter === 'VEG' ? '#2E6F40' : 'var(--text-muted)',
                boxShadow: activeFilter === 'VEG' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              🟢 Veg
            </button>
            <button 
              onClick={() => setActiveFilter('NON_VEG')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: activeFilter === 'NON_VEG' ? '#FFFFFF' : 'transparent',
                color: activeFilter === 'NON_VEG' ? '#A33B32' : 'var(--text-muted)',
                boxShadow: activeFilter === 'NON_VEG' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              🔴 Non-Veg
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Menu Items Grid */}
        <div style={{ flex: '1 1 60%' }}>
          {filteredItems.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}>
              No items match this category filter.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: item.isAvailable ? 1 : 0.65,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: item.isVeg ? '#2E6F40' : '#A33B32',
                        backgroundColor: item.isVeg ? 'var(--accent-green-light)' : 'var(--status-red-light)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${item.isVeg ? 'var(--accent-green-border)' : '#F3C7C4'}`
                      }}>
                        {item.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                      </span>
                      {!item.isAvailable && (
                        <span style={{ fontSize: '11px', color: '#A33B32', fontWeight: '600' }}>
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2C1810', marginBottom: '6px' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                      {item.description || 'Delicious dish made with fresh ingredients.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F5EFE6' }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#2C1810' }}>
                      ₹{item.sellingPrice}
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable}
                      style={{
                        backgroundColor: item.isAvailable ? '#4A2E1B' : '#E0D8CE',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        cursor: item.isAvailable ? 'pointer' : 'not-allowed',
                        boxShadow: item.isAvailable ? '0 2px 6px rgba(74, 46, 27, 0.2)' : 'none'
                      }}
                    >
                      {item.isAvailable ? '+ Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Cart & Orders */}
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Cart */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#2C1810' }}>
                Your Cart
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {cart.length} item{cart.length === 1 ? '' : 's'}
              </span>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-light)', fontSize: '13px' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>🧺</span>
                Your cart is empty.<br/>Select dishes from the menu to order.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
                  {cart.map(c => (
                    <div key={c.menuItemId} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid #F5EFE6'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#2C1810' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>₹{c.price} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                          <button 
                            onClick={() => updateQuantity(c.menuItemId, -1)}
                            style={{ padding: '2px 8px', border: 'none', background: 'var(--bg-alt)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                          >-</button>
                          <span style={{ padding: '2px 8px', fontSize: '12.5px', fontWeight: '600' }}>{c.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(c.menuItemId, 1)}
                            style={{ padding: '2px 8px', border: 'none', background: 'var(--bg-alt)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                          >+</button>
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px', minWidth: '45px', textAlign: 'right' }}>
                          ₹{c.price * c.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '10px', borderTop: '2px solid var(--border-color)', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', fontWeight: '700', color: '#2C1810' }}>
                    <span>Total Amount:</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                <button 
                  onClick={placeOrder} 
                  disabled={placing}
                  style={{
                    width: '100%',
                    backgroundColor: '#2E6F40',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: placing ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 10px rgba(46, 111, 64, 0.25)',
                    opacity: placing ? 0.7 : 1
                  }}
                >
                  {placing ? 'Placing Order...' : `Place Order (₹${cartTotal})`}
                </button>
              </div>
            )}
          </div>

          {/* Previous Orders Tracking */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#2C1810', marginBottom: '12px' }}>
              My Orders
            </h2>

            {orders.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-light)', textAlign: 'center', padding: '10px 0' }}>
                No past orders placed yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {orders.map(o => (
                  <div key={o.id} style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-alt)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <b style={{ fontSize: '13px', color: '#2C1810' }}>#{o.orderNumber}</b>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: o.orderStatus === 'COMPLETED' ? '#D2EEDB' : '#FEF0E0',
                        color: o.orderStatus === 'COMPLETED' ? '#1B542B' : '#965D24'
                      }}>
                        {o.orderStatus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Type: {o.orderType || 'ONLINE'}</span>
                      <b style={{ color: '#2C1810' }}>₹{o.totalAmount}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Feedback Modal */}
      {showFeedbackModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#2C1810' }}>
                  Customer Dining Feedback
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Help us improve your dining experience with your honest review
                </p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {feedbackSuccess ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: '#2E6F40' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🎉</span>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Thank You!</h4>
                <p style={{ fontSize: '13px' }}>Your review has been saved and shared with the restaurant manager.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '6px' }}>
                    Rating (1 to 5 Stars) *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          borderRadius: '6px',
                          border: feedbackData.rating === star ? '2px solid #C28E52' : '1px solid var(--border-color)',
                          backgroundColor: feedbackData.rating >= star ? '#FAF4EC' : '#FFFFFF',
                          fontSize: '18px',
                          cursor: 'pointer'
                        }}
                      >
                        {feedbackData.rating >= star ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                    Specific Dish (Optional)
                  </label>
                  <select
                    value={feedbackData.menuItemId}
                    onChange={e => setFeedbackData({ ...feedbackData, menuItemId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                  >
                    <option value="">General Overall Experience</option>
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (₹{i.sellingPrice})</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={feedbackData.customerName}
                    onChange={e => setFeedbackData({ ...feedbackData, customerName: e.target.value })}
                    placeholder="e.g. Rahul"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                    Your Review & Comments
                  </label>
                  <textarea
                    rows="3"
                    value={feedbackData.reviewText}
                    onChange={e => setFeedbackData({ ...feedbackData, reviewText: e.target.value })}
                    placeholder="What did you like about the food, taste, or service? Any complaints or suggestions?"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    style={{
                      flex: 1,
                      padding: '11px',
                      backgroundColor: '#2E6F40',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      cursor: submittingFeedback ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(46, 111, 64, 0.25)'
                    }}
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    style={{
                      padding: '11px 18px',
                      backgroundColor: 'var(--bg-alt)',
                      color: '#4A2E1B',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
