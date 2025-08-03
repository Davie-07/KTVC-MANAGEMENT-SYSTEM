import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './RegisterPage.css';

const courseLevels = ['Level 4', 'Level 5', 'Level 6'];

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    admission: '',
    email: '',
    course: '',
    level: '',
    terms: false,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{_id: string, name: string}>>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch published courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PUBLISHED_COURSES);
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error('Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox' && e.target instanceof HTMLInputElement;
    if (isCheckbox) {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        navigate('/verify-email', { state: { email: form.email } });
      } else {
        setError(data.message || data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-bg">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1 className="form-title">KANDARA COLLEGE</h1>
        <h2>Student Registration</h2>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Enter your first name" />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Enter your last name" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="Enter your phone number" />
          </div>
          <div className="form-group">
            <label htmlFor="admission">Admission Number</label>
            <input type="text" id="admission" name="admission" value={form.admission} onChange={handleChange} required placeholder="Enter your admission number" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required placeholder="Enter your email address" />
          </div>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <select id="course" name="course" value={form.course} onChange={handleChange} required>
              <option value="">Select Course</option>
              {coursesLoading ? (
                <option value="" disabled>Loading courses...</option>
              ) : (
                courses.map((course) => (
                  <option key={course._id} value={course.name}>{course.name}</option>
                ))
              )}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="level">Course Level</label>
            <select id="level" name="level" value={form.level} onChange={handleChange} required>
              <option value="">Select Level</option>
              {courseLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required placeholder="Create a password" />
          </div>
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="terms" name="terms" checked={form.terms} onChange={handleChange} />
          <label htmlFor="terms">
            I agree to the <Link to="/terms" target="_blank" style={{color:'#22c55e',textDecoration:'underline'}}>Terms and Conditions</Link>
          </label>
        </div>
        <button type="submit" className="shiny-btn" disabled={!form.terms || loading}>{loading ? 'Registering...' : 'Register'}</button>
        <div style={{marginTop:'0.5rem',textAlign:'center'}}>
          <span style={{color:'#888'}}>Already have an account? </span>
          <Link to="/login" style={{color:'#2563eb'}}>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage; 