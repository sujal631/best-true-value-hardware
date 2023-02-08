import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ProfilePage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>User Profile</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>User Profile Page</h1>
    </div>
  );
}
