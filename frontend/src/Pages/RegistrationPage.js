import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function RegistrationPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Registration</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Registration Page</h1>
    </div>
  );
}
