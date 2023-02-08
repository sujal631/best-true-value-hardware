import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SearchPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>Search</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>Search Page</h1>
    </div>
  );
}
