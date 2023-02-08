import React from 'react';

const LoadingSpinner = () => {
  // Define styles for the spinner
  const spinnerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  };

  const spinStyles = {
    border: '3px solid black',
    borderTop: '3px solid transparent',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={spinnerStyles}>
      <div style={spinStyles} />
    </div>
  );
};

export default LoadingSpinner;

// Add keyframes for the spinner animation
const styles = document.createElement('style');
styles.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;

document.head.appendChild(styles);
