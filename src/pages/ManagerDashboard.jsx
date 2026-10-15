import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/reports/business'),
      api.get('/ml/insights')
    ]).then(([reportsRes, mlRes]) => {
      setData(reportsRes.data.data);
      setInsights(mlRes.data.data || []);
    }).catch(err => {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Unable to connect to backend server. Please verify the service is running.');
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
          width: '36px',
          height: '36px',
          border: '3px solid #EAE3D2',
          borderTopColor: '#4A2E1B',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: '500', fontSize: '15px' }}>Loading restaurant dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--status-red-light)',
        border: '1px solid #F1B5B0',
        borderRadius: '10px',
        color: 'var(--status-red)',
        margin: '20px 0'
      }}>
        <h4 style={{ color: 'var(--status-red)', marginBottom: '6px' }}>Dashboard Connection Notice</h4>
        <p style={{ fontSize: '14px', marginBottom: '14px' }}>{error}</p>
        <button
          onClick={fetchDashboardData}
          style={{
            backgroundColor: '#4A2E1B',
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔄 Retry Dashboard Connection
        </button>
      </div>
    );
  }

  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No data returned.</div>;

  const totalRevenue = data.salesSummary?.totalRevenue != null ? Number(data.salesSummary.totalRevenue).toLocaleString('en-IN') : '0';
  const totalOrders = data.salesSummary?.totalOrders != null ? Number(data.salesSummary.totalOrders).toLocaleString('en-IN') : '0';
  const grossProfit = data.profitSummary?.grossProfit != null ? Number(data.profitSummary.grossProfit).toLocaleString('en-IN') : '0';
  const avgOrderValue = data.salesSummary?.averageOrderValue != null ? Number(data.salesSummary.averageOrderValue).toFixed(2) : (data.salesSummary?.totalOrders ? (data.salesSummary.totalRevenue / data.salesSummary.totalOrders).toFixed(2) : '0');

  const orderTypeData = [
    { name: 'Online Orders', count: data.salesSummary?.onlineOrders || 0 },
    { name: 'Counter Orders', count: data.salesSummary?.offlineOrders || 0 }
  ];

  const sortedDailyTrend = data.dailySalesTrend
    ? [...data.dailySalesTrend].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#2C1810', fontWeight: '700', marginBottom: '4px' }}>
            Restaurant Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Track sales, profit, best sellers, and order performance
          </p>
        </div>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2E6F40' }}></span>
          <span>Time Period: <b>{data.periodLabel || 'Last 30 Days'}</b></span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px'
      }}>
        {/* Card 1: Total Sales */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '22px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Sales (₹)
            </span>
            <span style={{ backgroundColor: 'var(--accent-gold-light)', padding: '5px 8px', borderRadius: '6px', fontSize: '15px' }}>
              💰
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2C1810', letterSpacing: '-0.5px' }}>
            ₹{totalRevenue}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Average Per Order: ₹{avgOrderValue}
          </div>
        </div>

        {/* Card 2: Orders */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '22px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Orders
            </span>
            <span style={{ backgroundColor: '#EDF4FA', padding: '5px 8px', borderRadius: '6px', fontSize: '15px' }}>
              📦
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2C1810', letterSpacing: '-0.5px' }}>
            {totalOrders}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {data.salesSummary?.onlineOrders || 0} Online · {data.salesSummary?.offlineOrders || 0} Counter
          </div>
        </div>

        {/* Card 3: Profit */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '22px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Profit (₹)
            </span>
            <span style={{ backgroundColor: 'var(--accent-green-light)', padding: '5px 8px', borderRadius: '6px', fontSize: '15px' }}>
              📈
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#2E6F40', letterSpacing: '-0.5px' }}>
            ₹{grossProfit}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Food Cost Deducted
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Chart 1: Revenue Trends */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2C1810', marginBottom: '4px' }}>
                Daily Sales Trend
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Daily sales across online orders and counter walk-ins
              </p>
            </div>
            {sortedDailyTrend.length === 1 && (
              <span style={{
                fontSize: '11.5px',
                backgroundColor: 'var(--accent-gold-light)',
                color: '#8A5217',
                border: '1px solid #EAD8C3',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                ℹ️ 1 Date Available ({sortedDailyTrend[0].date})
              </span>
            )}
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {sortedDailyTrend && sortedDailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedDailyTrend} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9C897E" 
                    tick={{ fontSize: 11, fill: '#725F54' }}
                    tickFormatter={(val) => {
                      if (!val) return '';
                      const parts = val.split('-');
                      if (parts.length === 3) {
                        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        const m = parseInt(parts[1], 10) - 1;
                        return `${parts[2]} ${months[m] || parts[1]}`;
                      }
                      return val;
                    }}
                  />
                  <YAxis 
                    stroke="#9C897E" 
                    tick={{ fontSize: 11, fill: '#725F54' }}
                    tickFormatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    domain={[0, (dataMax) => Math.ceil((dataMax || 1000) * 1.15)]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#2C1810', 
                      color: '#FFFFFF', 
                      borderRadius: '8px', 
                      border: 'none',
                      fontSize: '12.5px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      padding: '10px 14px'
                    }} 
                    formatter={(val, name, item) => [
                      `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${item.payload.orderCount || 0} orders)`, 
                      'Sales'
                    ]}
                    labelFormatter={(lbl) => `Date: ${lbl}`}
                  />
                  <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#C28E52" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#4A2E1B', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }} 
                    activeDot={{ r: 7, fill: '#2E6F40', stroke: '#FFFFFF', strokeWidth: 2 }} 
                    name="Daily Sales (₹)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                No daily sales trends recorded in this time period
              </div>
            )}
          </div>
          {sortedDailyTrend.length === 1 && (
            <div style={{ marginTop: '12px', fontSize: '11.5px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-alt)', padding: '8px 12px', borderRadius: '6px' }}>
              <b>Note:</b> Database records currently have 105 orders on date <code>{sortedDailyTrend[0].date}</code> (Total: ₹{Number(sortedDailyTrend[0].revenue).toLocaleString('en-IN')}). New dates will show automatically as orders are placed.
            </div>
          )}
        </div>

        {/* Chart 2: Online Orders vs Counter Orders */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2C1810', marginBottom: '4px' }}>
              Online Orders vs Counter Orders
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Comparison of customer online orders and walk-in counter bills
            </p>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderTypeData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" vertical={false} />
                <XAxis dataKey="name" stroke="#9C897E" tick={{ fontSize: 12, fontWeight: 500 }} />
                <YAxis stroke="#9C897E" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2C1810', 
                    color: '#FFFFFF', 
                    borderRadius: '8px', 
                    border: 'none',
                    fontSize: '12px'
                  }} 
                  formatter={(val) => [val, 'Orders Completed']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Bar 
                  dataKey="count" 
                  fill="#4A2E1B" 
                  radius={[6, 6, 0, 0]} 
                  name="Orders Completed" 
                  maxBarSize={60} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Recommendations & Menu Performance */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '26px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#2C1810' }}>
              Menu Performance
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            How your dishes perform based on popularity and profit margins
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {/* Best Sellers */}
          <div style={{
            backgroundColor: 'var(--accent-green-light)',
            border: '1px solid var(--accent-green-border)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--accent-green)' }}>
                  ⭐ Best Sellers
                </span>
                <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#D2EEDB', color: '#1B542B', padding: '2px 8px', borderRadius: '12px' }}>
                  High Profit · High Sales
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#245934', marginBottom: '12px' }}>
                <b>Tip:</b> Keep taste and recipe quality consistent. These are your top earners.
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1E4A2A',
              fontWeight: '500',
              minHeight: '44px'
            }}>
              {data.menuMatrix?.stars && data.menuMatrix.stars.length > 0
                ? data.menuMatrix.stars.map(s => s.name).join(', ')
                : <span style={{ color: '#88998C', fontStyle: 'italic' }}>No dishes currently in this group</span>
              }
            </div>
          </div>

          {/* Promote More */}
          <div style={{
            backgroundColor: 'var(--accent-gold-light)',
            border: '1px solid #E6D0BA',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '14.5px', color: '#965D24' }}>
                  🧩 Promote More
                </span>
                <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#F4DFCA', color: '#774718', padding: '2px 8px', borderRadius: '12px' }}>
                  High Profit · Low Sales
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#774718', marginBottom: '12px' }}>
                <b>Tip:</b> Highlight on the menu and ask staff to recommend these dishes.
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#653B12',
              fontWeight: '500',
              minHeight: '44px'
            }}>
              {data.menuMatrix?.puzzles && data.menuMatrix.puzzles.length > 0
                ? data.menuMatrix.puzzles.map(s => s.name).join(', ')
                : <span style={{ color: '#9E8877', fontStyle: 'italic' }}>No dishes currently in this group</span>
              }
            </div>
          </div>

          {/* Popular, Low Profit */}
          <div style={{
            backgroundColor: 'var(--status-blue-light)',
            border: '1px solid #C4D7E8',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--status-blue)' }}>
                  🐴 Popular, Low Profit
                </span>
                <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#D4E4F4', color: '#1B426B', padding: '2px 8px', borderRadius: '12px' }}>
                  Low Profit · High Sales
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#1E4773', marginBottom: '12px' }}>
                <b>Tip:</b> Slightly increase prices or look for cheaper ingredient suppliers.
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1A3F66',
              fontWeight: '500',
              minHeight: '44px'
            }}>
              {data.menuMatrix?.plowhorses && data.menuMatrix.plowhorses.length > 0
                ? data.menuMatrix.plowhorses.map(s => s.name).join(', ')
                : <span style={{ color: '#8898A8', fontStyle: 'italic' }}>No dishes currently in this group</span>
              }
            </div>
          </div>

          {/* Low Sales, Low Profit */}
          <div style={{
            backgroundColor: 'var(--status-red-light)',
            border: '1px solid #F3C7C4',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--status-red)' }}>
                  🐕 Low Sales, Low Profit
                </span>
                <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#FAD5D3', color: '#812820', padding: '2px 8px', borderRadius: '12px' }}>
                  Low Profit · Low Sales
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#812820', marginBottom: '12px' }}>
                <b>Tip:</b> Update recipe, offer special discounts, or replace with new dishes.
              </p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#71231C',
              fontWeight: '500',
              minHeight: '44px'
            }}>
              {data.menuMatrix?.dogs && data.menuMatrix.dogs.length > 0
                ? data.menuMatrix.dogs.map(s => s.name).join(', ')
                : <span style={{ color: '#A68582', fontStyle: 'italic' }}>No dishes currently in this group</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trends & Alerts */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🤖</span>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2C1810' }}>
                Sales Trends & Alerts
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Automatic checks identifying sudden spikes or drops in food orders
            </p>
          </div>
        </div>

        {insights.length === 0 ? (
          <div style={{
            padding: '28px 20px',
            backgroundColor: 'var(--bg-alt)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px dashed #DACEC0'
          }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>🛡️</span>
            <h4 style={{ fontSize: '14px', color: '#4A2E1B', marginBottom: '4px' }}>All Sales Patterns Normal</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              No unusual sales spikes or drops detected across your menu items right now.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {insights.map((ins) => {
              const isWarning = ins.severity === 'WARNING';
              const isAction = ins.severity === 'ACTION_REQUIRED';
              const badgeBg = isAction ? '#FAD5D3' : isWarning ? '#FCE6CE' : '#D4E4F4';
              const badgeColor = isAction ? '#812820' : isWarning ? '#8C4F13' : '#1B426B';
              const borderLeftColor = isAction ? 'var(--status-red)' : isWarning ? 'var(--status-amber)' : 'var(--status-blue)';

              return (
                <div 
                  key={ins.id} 
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    borderLeft: `5px solid ${borderLeftColor}`,
                    backgroundColor: '#FAF8F5',
                    padding: '14px 16px', 
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <b style={{ fontSize: '13.5px', color: '#2C1810' }}>{ins.menuItemName || 'General Item'}</b>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      backgroundColor: badgeBg, 
                      color: badgeColor, 
                      padding: '2px 8px', 
                      borderRadius: '10px' 
                    }}>
                      {ins.severity || 'INFO'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#70574A', fontWeight: '600', marginBottom: '4px' }}>
                    {ins.insightType}
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    {ins.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
