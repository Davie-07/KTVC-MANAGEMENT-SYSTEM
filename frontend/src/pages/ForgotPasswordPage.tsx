import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message + ' Check your email for the reset code.');
      } else {
        setError(data.message || 'Request failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-bg">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        {message && (
          <div className="success-msg">
            {message}
            <br />
            <Link to="/reset-password" style={{ color: '#22c55e', textDecoration: 'underline' }}>
              Click here to reset your password
            </Link>
          </div>
        )}
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/reset-password" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Already have a reset code? Reset password here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage; 