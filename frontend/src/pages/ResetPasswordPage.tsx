import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './ResetPasswordPage.css';

const ResetPasswordPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', code: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || 'Reset failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-bg">
      <form className="reset-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="code">Reset Code</label>
          <input type="text" id="code" name="code" value={form.code} onChange={handleChange} required maxLength={6} />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input type="password" id="newPassword" name="newPassword" value={form.newPassword} onChange={handleChange} required minLength={6} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage; 