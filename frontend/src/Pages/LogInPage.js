import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function LogInPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Log In</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Log In Page</h1>
    </div>
  );
}
