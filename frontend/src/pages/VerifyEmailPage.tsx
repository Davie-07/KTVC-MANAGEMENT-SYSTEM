import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './VerifyEmailPage.css';

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', code: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).email) {
      setForm((prev) => ({ ...prev, email: (location.state as any).email }));
    }
  }, [location.state]);

  // Auto-verify when code reaches 6 digits
  useEffect(() => {
    if (form.code.length === 6 && form.email) {
      handleAutoVerify();
    }
  }, [form.code, form.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numbers for code field
    if (name === 'code') {
      const numericValue = value.replace(/\D/g, '');
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAutoVerify = async () => {
    if (loading || isVerified) return;
    
    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      const res = await fetch(API_ENDPOINTS.VERIFY_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Email verified successfully! Redirecting to login...');
        setIsVerified(true);
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please login with your credentials.',
              email: form.email 
            } 
          });
        }, 2000);
      } else {
        setError(data.message || 'Verification failed. Please check your code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.code.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }
    await handleAutoVerify();
  };

  return (
    <div className="verify-email-bg">
      <form className="verify-email-form" onSubmit={handleSubmit}>
        <h2>Email Verification</h2>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '1rem' }}>
          Enter the 6-digit code sent to your email
        </p>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="code">Verification Code</label>
          <input 
            type="text" 
            id="code" 
            name="code" 
            value={form.code} 
            onChange={handleChange} 
            required 
            maxLength={6}
            placeholder="Enter 6-digit code"
            disabled={loading || isVerified}
            style={{ 
              textAlign: 'center', 
              fontSize: '1.2rem', 
              letterSpacing: '0.5rem',
              fontFamily: 'monospace'
            }}
          />
          {form.code.length > 0 && form.code.length < 6 && (
            <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
              {6 - form.code.length} digits remaining
            </small>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={loading || form.code.length !== 6 || isVerified}
          style={{ 
            background: isVerified ? '#22c55e' : '#2563eb',
            cursor: isVerified ? 'default' : 'pointer'
          }}
        >
          {loading ? 'Verifying...' : isVerified ? 'Verified ✓' : 'Verify Email'}
        </button>
        
        {message && (
          <div className="success-msg">
            {message}
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              ⏳ Redirecting to login page...
            </div>
          </div>
        )}
        
        {error && <div className="error-msg">{error}</div>}
        
        {!loading && !isVerified && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <small style={{ color: '#9ca3af' }}>
              Didn't receive the code?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#2563eb', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Go back to login
              </button>
            </small>
          </div>
        )}
      </form>
    </div>
  );
};

export default VerifyEmailPage; 