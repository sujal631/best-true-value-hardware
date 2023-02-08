import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function ListUsersPage() {
  return (
    <div>
      {/* Setting the page title using react-helmet-async */}
      <Helmet>
        <title>List Users</title>
      </Helmet>

      {/* Displaying the page header */}
      <h1>List Users Page</h1>
    </div>
  );
}
