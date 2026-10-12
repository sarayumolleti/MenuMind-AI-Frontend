import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import CustomerView from './pages/CustomerView';
import StaffView from './pages/StaffView';
import ManagerDashboard from './pages/ManagerDashboard';
import MenuManager from './pages/MenuManager';
import SalesHistory from './pages/SalesHistory';
import FeedbackDashboard from './pages/FeedbackDashboard';

const Layout = ({ auth, setAuth, children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
    navigate('/');
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Navigation Header */}
      <header style={{
        backgroundColor: '#24140D',
        color: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(36, 20, 13, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #3B2215'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo Brand */}
          <div 
            onClick={() => auth && navigate(auth.includes('MANAGER') ? '/dashboard' : auth.includes('STAFF') ? '/pos' : '/menu')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#C28E52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '20px',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(194, 142, 82, 0.4)'
            }}>
              M
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.3px', color: '#FDFBF7' }}>
                MenuMind <span style={{ color: '#D4A373', fontWeight: '600', fontSize: '15px' }}>AI</span>
              </div>
              <div style={{ fontSize: '11px', color: '#B39E93', letterSpacing: '0.5px' }}>
                RESTAURANT INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {auth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(auth.includes('MANAGER') || auth.includes('ADMIN')) && (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    style={{
                      background: isCurrent('/dashboard') ? '#3D2214' : 'transparent',
                      color: isCurrent('/dashboard') ? '#F4D3B0' : '#D9C8BF',
                      border: isCurrent('/dashboard') ? '1px solid #5A3521' : '1px solid transparent',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📊</span> Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/menu-manager')}
                    style={{
                      background: isCurrent('/menu-manager') ? '#3D2214' : 'transparent',
                      color: isCurrent('/menu-manager') ? '#F4D3B0' : '#D9C8BF',
                      border: isCurrent('/menu-manager') ? '1px solid #5A3521' : '1px solid transparent',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📋</span> Manage Menu
                  </button>
                  <button 
                    onClick={() => navigate('/sales')}
                    style={{
                      background: isCurrent('/sales') ? '#3D2214' : 'transparent',
                      color: isCurrent('/sales') ? '#F4D3B0' : '#D9C8BF',
                      border: isCurrent('/sales') ? '1px solid #5A3521' : '1px solid transparent',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🧾</span> Sales & Bills
                  </button>
                  <button 
                    onClick={() => navigate('/feedbacks')}
                    style={{
                      background: isCurrent('/feedbacks') ? '#3D2214' : 'transparent',
                      color: isCurrent('/feedbacks') ? '#F4D3B0' : '#D9C8BF',
                      border: isCurrent('/feedbacks') ? '1px solid #5A3521' : '1px solid transparent',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>⭐</span> Feedback & Reviews
                  </button>
                </>
              )}

              {auth.includes('STAFF') && (
                <button 
                  onClick={() => navigate('/pos')}
                  style={{
                    background: isCurrent('/pos') ? '#3D2214' : 'transparent',
                    color: isCurrent('/pos') ? '#F4D3B0' : '#D9C8BF',
                    border: isCurrent('/pos') ? '1px solid #5A3521' : '1px solid transparent',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🧾</span> Counter Billing
                </button>
              )}

              {auth.includes('CUSTOMER') && (
                <button 
                  onClick={() => navigate('/menu')}
                  style={{
                    background: isCurrent('/menu') ? '#3D2214' : 'transparent',
                    color: isCurrent('/menu') ? '#F4D3B0' : '#D9C8BF',
                    border: isCurrent('/menu') ? '1px solid #5A3521' : '1px solid transparent',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🍽️</span> Order Food
                </button>
              )}

              {/* User Role Tag */}
              <div style={{
                marginLeft: '12px',
                padding: '4px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                fontSize: '11px',
                color: '#C7B6AD',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                {auth.replace('ROLE_', '')}
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: '#E07A5F',
                  border: '1px solid rgba(224, 122, 95, 0.4)',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  marginLeft: '8px',
                  fontWeight: '600'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px 48px' }}>
        {children}
      </main>

      {/* Subtle Restaurant Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-light)',
        fontSize: '12px',
        backgroundColor: 'var(--bg-alt)'
      }}>
        MenuMind AI — Intelligent Restaurant Analytics & Optimization System
      </footer>
    </div>
  );
};

export default function App() {
  const [auth, setAuth] = useState(localStorage.getItem('role'));

  return (
    <BrowserRouter>
      <Layout auth={auth} setAuth={setAuth}>
        <Routes>
          <Route path="/" element={!auth ? <Login setAuth={setAuth} /> : <Navigate to={auth.includes('MANAGER') ? '/dashboard' : auth.includes('STAFF') ? '/pos' : '/menu'} />} />
          <Route path="/dashboard" element={auth?.includes('MANAGER') || auth?.includes('ADMIN') ? <ManagerDashboard /> : <Navigate to="/" />} />
          <Route path="/menu-manager" element={auth?.includes('MANAGER') || auth?.includes('ADMIN') ? <MenuManager /> : <Navigate to="/" />} />
          <Route path="/sales" element={auth?.includes('MANAGER') || auth?.includes('ADMIN') ? <SalesHistory /> : <Navigate to="/" />} />
          <Route path="/feedbacks" element={auth?.includes('MANAGER') || auth?.includes('ADMIN') ? <FeedbackDashboard /> : <Navigate to="/" />} />
          <Route path="/pos" element={auth?.includes('STAFF') || auth?.includes('MANAGER') ? <StaffView /> : <Navigate to="/" />} />
          <Route path="/menu" element={auth?.includes('CUSTOMER') ? <CustomerView /> : <Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
