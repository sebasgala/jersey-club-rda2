import React from 'react';
import PropTypes from 'prop-types';

const Drawer = ({ isOpen, position, onClose, children }) => {
  const positionClasses = position === 'left' ? '-translate-x-full' : 'translate-x-full';
  const openClasses = isOpen ? 'translate-x-0' : positionClasses;

  return (
    <div
      className={`fixed top-0 ${position}-0 h-full w-80 max-w-[85vw] bg-white shadow-lg z-30 transform ${openClasses} transition-transform duration-300`}
    >
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        onClick={onClose}
        aria-label="Cerrar drawer"
      >
        &times;
      </button>
      <div className="p-4 overflow-y-auto h-full">{children}</div>
    </div>
  );
};

Drawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  position: PropTypes.oneOf(['left', 'right']).isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Drawer;