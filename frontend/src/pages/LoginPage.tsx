import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [loginMode, setLoginMode] = useState<'email' | 'teacherId'>('email');
  const [form, setForm] = useState({ email: '', teacherId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Handle success message and email from email verification
  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.message) {
        setSuccessMessage(state.message);
        // Clear the message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      }
      if (state.email) {
        setForm(prev => ({ ...prev, email: state.email }));
      }
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Prepare request body based on login mode
    const requestBody = loginMode === 'teacherId' 
      ? { teacherId: form.teacherId, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        if (data.user.role === 'student') {
          navigate('/student');
        } else if (data.user.role === 'teacher') {
          navigate('/teacher');
        } else if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="form-title">KANDARA COLLEGE</h1>
        <h2>Login</h2>
        
        {successMessage && (
          <div className="success-msg" style={{
            color: '#22c55e',
            background: '#f0fdf4',
            padding: '0.8rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #bbf7d0',
            textAlign: 'center'
          }}>
            ✅ {successMessage}
          </div>
        )}
        
        {error && <div className="error-msg">{error}</div>}
        
        {/* Login Mode Toggle */}
        <div className="login-mode-toggle">
          <button 
            type="button" 
            className={`toggle-btn ${loginMode === 'email' ? 'active' : ''}`}
            onClick={() => setLoginMode('email')}
          >
            Student/Admin
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${loginMode === 'teacherId' ? 'active' : ''}`}
            onClick={() => setLoginMode('teacherId')}
          >
            Teacher
          </button>
        </div>

        <div className="form-group">
          <label htmlFor={loginMode === 'email' ? 'email' : 'teacherId'}>
            {loginMode === 'email' ? 'Email Address' : 'Teacher ID'}
          </label>
          <input 
            type={loginMode === 'email' ? 'email' : 'text'} 
            id={loginMode === 'email' ? 'email' : 'teacherId'} 
            name={loginMode === 'email' ? 'email' : 'teacherId'} 
            value={loginMode === 'email' ? form.email : form.teacherId} 
            onChange={handleChange} 
            placeholder={loginMode === 'email' ? 'Enter your email' : 'Enter your 10-digit Teacher ID'}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            placeholder="Enter your password"
            required 
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="form-links">
          <Link to="/forgot-password">Forgot Password?</Link>
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 