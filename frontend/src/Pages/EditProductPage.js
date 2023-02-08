import React from 'react';
import { Helmet } from 'react-helmet-async';

// A functional component to render the Edit Product page
const EditProductPage = () => {
  return (
    <div>
      {/* Set the title of the page */}
      <Helmet>
        <title>Edit Product</title>
      </Helmet>
      {/* Render the header for the Edit Product page */}
      <h1>Edit Product Page</h1>
    </div>
  );
};

export default EditProductPage;
