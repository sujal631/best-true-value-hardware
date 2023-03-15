// Import necessary hooks from React and React Router DOM
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Create a ScrollToTop functional component
const ScrollToTop = () => {
  // Get the current pathname from the useLocation hook
  const { pathname } = useLocation();

  // Use the useEffect hook to call the scrollTo function when the pathname changes
  useEffect(() => {
    // Scroll the window to the top-left corner (0, 0) when the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]); // Specify pathname as the dependency for useEffect

  // The component does not render anything, so return null
  return null;
};

// Export the ScrollToTop component
export default ScrollToTop;
