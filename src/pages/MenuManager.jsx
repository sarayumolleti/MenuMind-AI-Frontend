import React, { useState, useEffect } from 'react';
import api from '../api';

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    sellingPrice: '',
    estimatedCost: '',
    isVeg: true,
    isAvailable: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/menu-items'),
      api.get('/categories')
    ]).then(([itemsRes, catsRes]) => {
      setItems(itemsRes.data.data || []);
      setCategories(catsRes.data.data || []);
    }).catch(err => {
      console.error(err);
      alert('Failed to load menu data: ' + (err.response?.data?.message || err.message));
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAvailability = async (id, current) => {
    setUpdatingId(id);
    const nextStatus = !current;
    try {
      const res = await api.patch(`/menu-items/${id}/availability?isAvailable=${nextStatus}`);
      const updatedItem = res.data?.data;
      if (updatedItem) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: updatedItem.isAvailable } : item));
      } else {
        setItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: nextStatus } : item));
      }
    } catch (e) {
      alert('Error updating stock status: ' + (e.response?.data?.message || e.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      sellingPrice: '',
      estimatedCost: '',
      isVeg: true,
      isAvailable: true
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      categoryId: item.categoryId || (categories.find(c => c.name === item.categoryName)?.id) || (categories[0]?.id || ''),
      sellingPrice: item.sellingPrice || '',
      estimatedCost: item.estimatedCost || '',
      isVeg: item.isVeg != null ? item.isVeg : true,
      isAvailable: item.isAvailable != null ? item.isAvailable : true
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the menu? It will be safely archived without affecting past sales reports.`)) {
      return;
    }
    try {
      await api.delete(`/menu-items/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
      alert(`"${name}" has been removed from the active menu.`);
    } catch (e) {
      alert('Error removing item: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Food name is required.');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Please select a category.');
      return;
    }
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      setFormError('Selling price must be greater than 0.');
      return;
    }
    if (formData.estimatedCost == null || Number(formData.estimatedCost) < 0) {
      setFormError('Food cost cannot be negative.');
      return;
    }

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: Number(formData.categoryId),
      sellingPrice: Number(formData.sellingPrice),
      estimatedCost: Number(formData.estimatedCost),
      isVeg: formData.isVeg,
      isAvailable: formData.isAvailable,
      isActive: true
    };

    try {
      if (editingItem) {
        const res = await api.put(`/menu-items/${editingItem.id}`, payload);
        const updated = res.data?.data;
        setItems(prev => prev.map(item => item.id === editingItem.id ? updated : item));
        alert('Food item updated successfully!');
      } else {
        const res = await api.post('/menu-items', payload);
        const created = res.data?.data;
        setItems(prev => [...prev, created]);
        alert('New food item added to the menu!');
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save food item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && items.length === 0) {
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
        <p style={{ fontWeight: '500', fontSize: '14px' }}>Loading menu items...</p>
      </div>
    );
  }

  const availableCount = items.filter(i => i.isAvailable).length;
  const outOfStockCount = items.length - availableCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#2C1810', fontWeight: '700', marginBottom: '4px' }}>
            Menu Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Add new dishes, update prices & food costs, manage categories, and switch stock availability
          </p>
        </div>
        
        {/* Actions & Badges */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenAdd}
            style={{
              backgroundColor: '#4A2E1B',
              color: '#FFFFFF',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(74, 46, 27, 0.25)'
            }}
          >
            <span>+</span> Add New Food Item
          </button>

          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2E6F40' }}></span>
            <span>Available: <b>{availableCount}</b></span>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A33B32' }}></span>
            <span>Out of Stock: <b>{outOfStockCount}</b></span>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          No menu items found. Click "+ Add New Food Item" above to get started.
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
                  <th style={{ padding: '14px 18px' }}>Food Item</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Price</th>
                  <th style={{ padding: '14px 18px' }}>Food Cost</th>
                  <th style={{ padding: '14px 18px' }}>Profit %</th>
                  <th style={{ padding: '14px 18px' }}>Food Type</th>
                  <th style={{ padding: '14px 18px' }}>Stock Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '13.5px' }}>
                {items.map((item, index) => {
                  const margin = (item.sellingPrice && item.estimatedCost) 
                    ? (((item.sellingPrice - item.estimatedCost) / item.sellingPrice) * 100).toFixed(0)
                    : null;

                  return (
                    <tr 
                      key={item.id} 
                      style={{
                        borderBottom: index !== items.length - 1 ? '1px solid #F3EDE2' : 'none',
                        backgroundColor: index % 2 === 1 ? '#FDFCFA' : '#FFFFFF',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ fontWeight: '600', color: '#2C1810', fontSize: '14px' }}>{item.name}</div>
                        {item.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '280px' }}>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 18px', color: '#4A2E1B', fontWeight: '500' }}>
                        {item.categoryName || 'General'}
                      </td>
                      <td style={{ padding: '16px 18px', fontWeight: '600', color: '#2C1810' }}>
                        ₹{item.sellingPrice}
                      </td>
                      <td style={{ padding: '16px 18px', color: 'var(--text-muted)' }}>
                        ₹{item.estimatedCost}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        {margin != null ? (
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: Number(margin) >= 50 ? '#2E6F40' : '#8C4F13',
                            backgroundColor: Number(margin) >= 50 ? 'var(--accent-green-light)' : 'var(--status-amber-light)',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {margin}%
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        {item.isVeg ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#2E6F40',
                            backgroundColor: 'var(--accent-green-light)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--accent-green-border)'
                          }}>
                            <span>🟢</span> Veg
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#A33B32',
                            backgroundColor: 'var(--status-red-light)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #F3C7C4'
                          }}>
                            <span>🔴</span> Non-Veg
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        {item.isAvailable ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#1B542B'
                          }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2E6F40' }}></span>
                            In Stock
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#A33B32'
                          }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#A33B32' }}></span>
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button 
                            onClick={() => toggleAvailability(item.id, item.isAvailable)}
                            disabled={updatingId === item.id}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              cursor: updatingId === item.id ? 'not-allowed' : 'pointer',
                              backgroundColor: item.isAvailable ? '#FAF3EC' : 'var(--accent-green-light)',
                              color: item.isAvailable ? '#8C4F13' : '#1B542B',
                              border: item.isAvailable ? '1px solid #E4D2C1' : '1px solid var(--accent-green-border)',
                              opacity: updatingId === item.id ? 0.6 : 1
                            }}
                          >
                            {updatingId === item.id 
                              ? 'Saving...' 
                              : item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                          </button>

                          <button 
                            onClick={() => handleOpenEdit(item)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              backgroundColor: 'var(--bg-alt)',
                              color: '#4A2E1B',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button 
                            onClick={() => handleDelete(item.id, item.name)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              backgroundColor: 'var(--status-red-light)',
                              color: 'var(--status-red)',
                              border: '1px solid #F1B5B0'
                            }}
                            title="Remove / Hide Item"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Food Item Modal */}
      {showModal && (
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
            maxWidth: '520px',
            width: '100%',
            padding: '26px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2C1810' }}>
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--status-red-light)', color: 'var(--status-red)', borderRadius: '6px', fontSize: '13px', marginBottom: '14px', border: '1px solid #F1B5B0' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveItem}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Paneer Butter Masala"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="e.g. 280"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                    Food Cost (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.estimatedCost}
                    onChange={e => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="e.g. 110"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, recipe style, and taste notes..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                    Food Type
                  </label>
                  <select
                    value={formData.isVeg ? 'VEG' : 'NON_VEG'}
                    onChange={e => setFormData({ ...formData, isVeg: e.target.value === 'VEG' })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                  >
                    <option value="VEG">🟢 Vegetarian</option>
                    <option value="NON_VEG">🔴 Non-Vegetarian</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '4px' }}>
                    Availability
                  </label>
                  <select
                    value={formData.isAvailable ? 'IN_STOCK' : 'OUT_OF_STOCK'}
                    onChange={e => setFormData({ ...formData, isAvailable: e.target.value === 'IN_STOCK' })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '11px',
                    backgroundColor: '#4A2E1B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Food Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
          </div>
        </div>
      )}
    </div>
  );
}
