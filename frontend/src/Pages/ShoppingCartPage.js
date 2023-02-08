import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ShoppingCartPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Shopping Cart Page</h1>
    </div>
  );
}
