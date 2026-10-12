import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login({ setAuth }) {
  const [email, setEmail] = useState('manager@spicegarden.com');
  const [password, setPassword] = useState('Manager@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, role } = res.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('role', role);
      setAuth(role);
      navigate(role.includes('MANAGER') || role.includes('ADMIN') ? '/dashboard' : role.includes('STAFF') ? '/pos' : '/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCreds = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px',
        position: 'relative'
      }}>
        {/* Header Decorator */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            backgroundColor: '#4A2E1B',
            color: '#FFFFFF',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            boxShadow: '0 4px 10px rgba(74, 46, 27, 0.25)',
            marginBottom: '12px'
          }}>
            M
          </div>
          <h2 style={{ fontSize: '24px', color: '#2C1810', marginBottom: '6px', fontWeight: '700' }}>
            Welcome to MenuMind
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
            Sign in to access your restaurant management portal
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--status-red-light)',
            color: 'var(--status-red)',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            border: '1px solid #F1B5B0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '6px' }}>
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="e.g. manager@spicegarden.com"
              style={{
                width: '100%',
                padding: '11px 13px',
                borderRadius: '8px',
                border: '1px solid #D8CFC4',
                backgroundColor: '#FAF8F5',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }} 
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#3B2215', marginBottom: '6px' }}>
              Password
            </label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '11px 13px',
                borderRadius: '8px',
                border: '1px solid #D8CFC4',
                backgroundColor: '#FAF8F5',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4A2E1B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14.5px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 10px rgba(74, 46, 27, 0.2)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px dashed var(--border-color)',
          fontSize: '12px'
        }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
            Quick Demo Credentials:
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setDemoCreds('manager@spicegarden.com', 'Manager@123')}
              style={{
                background: 'var(--bg-alt)',
                border: '1px solid var(--border-color)',
                padding: '5px 9px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: '#4A2E1B'
              }}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => setDemoCreds('staff@spicegarden.com', 'Staff@123')}
              style={{
                background: 'var(--bg-alt)',
                border: '1px solid var(--border-color)',
                padding: '5px 9px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: '#4A2E1B'
              }}
            >
              Staff (POS)
            </button>
            <button
              type="button"
              onClick={() => setDemoCreds('alice@customer.com', 'Customer@123')}
              style={{
                background: 'var(--bg-alt)',
                border: '1px solid var(--border-color)',
                padding: '5px 9px',
                borderRadius: '6px',
                fontSize: '11.5px',
                cursor: 'pointer',
                color: '#4A2E1B'
              }}
            >
              Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
