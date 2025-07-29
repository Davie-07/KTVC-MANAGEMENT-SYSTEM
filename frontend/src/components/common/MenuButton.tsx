import React from 'react';

interface MenuButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <button 
      className="floating-menu-btn"
      onClick={onClick}
      aria-label="Toggle Menu"
    >
      MENU
    </button>
  );
};

export default MenuButton; 