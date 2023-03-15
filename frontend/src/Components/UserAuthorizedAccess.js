//Import necessary modules
import React, { useContext } from 'react';
import { Store } from '../Store';
import { Navigate } from 'react-router-dom';

function useAuthorization() {
  // Get the state object from the global store
  const { state } = useContext(Store);
  // Destructure the userInfo object from the state
  const { userInfo } = state;
  // Check if the user is authorized based on the userInfo object
  const isAuthorized = userInfo !== null;
  return isAuthorized;
}

export default function UserAuthorizedAccess({ children, adminOnly = false }) {
  // Get the authorization status using the useAuthorization hook
  const isAuthorized = useAuthorization();

  // Conditionally render the protected content or redirect to the login page
  return isAuthorized ? children : <Navigate to="/login" />;
}
