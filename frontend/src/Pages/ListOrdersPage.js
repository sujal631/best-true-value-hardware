import React from 'react';
import { Helmet } from 'react-helmet-async';

// A functional component that returns the page content for List Orders page
const ListOrdersPage = () => {
  return (
    <div>
      {/* Set the title of the page dynamically in the browser tab */}
      <Helmet>
        <title>List Orders</title>
      </Helmet>

      {/* Page header */}
      <h1>List Orders Page</h1>
    </div>
  );
};

export default ListOrdersPage;
