import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'linear-gradient(90deg, #23232b 0%, #2d2d3a 100%)',
      color: '#e5e7eb',
      padding: '1rem 0 0.5rem 0',
      marginTop: '2rem',
      fontFamily: 'inherit',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Title Row */}
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', letterSpacing: 1, marginBottom: '0.3rem', color: '#fff' }}>
        Kandara Technical and Vocational Training College
      </div>
      {/* Motto Row */}
      <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '1rem', color: '#d1d5db' }}>
        Nuturing Technical Skills and Competence
      </div>
      {/* Info Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '2rem',
        marginBottom: '1rem',
        padding: '0 1rem',
      }}>
        {/* Left Side */}
        <div style={{ flex: 1, minWidth: 220, fontSize: '0.9rem', lineHeight: 1.7 }}>
          <div>Phone: <a href="tel:+254716819330" style={{ color: '#a3e635', textDecoration: 'none' }}>+254 716 819 330</a></div>
          <div style={{ marginTop: '0.5rem' }}>
            <div>Located at:</div>
            <div>Near Kiranga market</div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <div>Open Hours:</div>
            <div>Mon - Fri 8AM - 5PM</div>
          </div>
        </div>
        {/* Right Side */}
        <div style={{ flex: 1, minWidth: 220, textAlign: 'center', fontSize: '1rem', fontWeight: 500, letterSpacing: 1 }}>
          <div>HELB</div>
          <div style={{ marginTop: '0.5rem' }}>CONNECT</div>
        </div>
      </div>
      {/* Bottom Row */}
      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af', borderTop: '1px solid #374151', paddingTop: '0.8rem', marginTop: '0.8rem' }}>
        KTVC ONLINE - ALL RIGHTS RESERVED copyright 2025.
      </div>
    </footer>
  );
};

export default Footer; 