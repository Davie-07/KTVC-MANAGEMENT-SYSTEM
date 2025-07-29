import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close Menu"
        >
          ×
        </button>
        {children}
      </div>
    </>
  );
};

export default Sidebar; 