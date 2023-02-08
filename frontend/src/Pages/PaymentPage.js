import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PaymentPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Payment Methods</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Select Payment Method Page</h1>
    </div>
  );
}
