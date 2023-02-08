import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function OrderHistoryPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Order History</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Order History Page</h1>
    </div>
  );
}
