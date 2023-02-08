import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ShippingInfoPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Shipping Info</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Shipping Info Page</h1>
    </div>
  );
}
