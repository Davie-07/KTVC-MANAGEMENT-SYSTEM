import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <div className="homepage-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Kandara Technical and Vocational Training College</h1>
            <p className="hero-subtitle">We value your presence because you matter to us.</p>
          </div>
        </div>
        
        <div className="cards-section">
          <div className="card-grid">
            <div className="welcome-card">
              <div className="card-header">
                <h2>Welcome to KTVC</h2>
                <div className="card-icon">🎓</div>
              </div>
              <div className="card-content">
                <p>Experience excellence in technical and vocational education. Our comprehensive school management system provides seamless access to all academic resources.</p>
                <div className="card-features">
                  <div className="feature">
                    <span className="feature-icon">📚</span>
                    <span>Course Management</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📊</span>
                    <span>Academic Analytics</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">💬</span>
                    <span>Communication Tools</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">💰</span>
                    <span>Fee Management</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="login-card">
              <div className="card-header">
                <h2>Get Started</h2>
                <div className="card-icon">🚀</div>
              </div>
              <div className="card-content">
                <p>Access your personalized dashboard and manage your academic journey with ease.</p>
                <div className="action-buttons">
                  <Link to="/login" className="btn-primary">
                    <span className="btn-icon">🔐</span>
                    Login to Account
                  </Link>
                  <Link to="/register" className="btn-secondary">
                    <span className="btn-icon">📝</span>
                    Register New Account
                  </Link>
                </div>
                <div className="quick-info">
                  <p><strong>New Students:</strong> Register to create your account</p>
                  <p><strong>Returning Users:</strong> Login with your credentials</p>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="card-header">
                <h2>About KTVC</h2>
                <div className="card-icon">🏫</div>
              </div>
              <div className="card-content">
                <p>Kandara Technical and Vocational Training College is committed to providing quality education and fostering technical skills development.</p>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Students</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">20+</span>
                    <span className="stat-label">Courses</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Teachers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 