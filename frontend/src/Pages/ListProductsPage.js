import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ListProductsPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>List Products</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>List Products Page</h1>
    </div>
  );
}
