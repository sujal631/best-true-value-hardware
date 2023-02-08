import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function PreviewOrderPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Preview Order</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Preview Order Page</h1>
    </div>
  );
}
