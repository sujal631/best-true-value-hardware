import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import Product from '../Components/Product';
import Slider from '../Components/Slider';
import { Helmet } from 'react-helmet-async';
import Message from '../Components/MessageComponent';
import LoadingSpinner from '../Components/LoadingComponent';
import Pagination from '../Components/Pagination';

// HomePage component for displaying all products
const HomePage = () => {
  // State to keep track of loading and error status
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // State to store the list of products
  const [productList, setProductList] = useState([]);

  // State to keep track of the current page number
  const [currentPage, setCurrentPage] = useState(1);

  // Number of products per page
  const [postsPerPage] = useState(12);

  // Effect hook to retrieve products from the API and update the productList state
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Call the API to retrieve products
        const { data } = await axios.get('/api/products');
        setProductList(data);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Scroll to the top of the page when currentPage changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Calculate the index of the first and last product to be displayed
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = productList.slice(firstPostIndex, lastPostIndex);

  return (
    <div>
      {/* Set the title of the page */}
      <Helmet>
        <title>Best True Value Hardware</title>
      </Helmet>
      {/* Render the slider component */}
      <Slider />
      {/* Display the title for the product list */}
      <h1>All Products</h1>
      <div className="product-container">
        {/* Conditionally render the loading component if the data is being fetched, error component if there is an error, or the product list if the data is available */}
        {isLoading ? (
          <LoadingSpinner />
        ) : errorMessage ? (
          <Message variant="danger">{errorMessage}</Message>
        ) : (
          <Row>
            {currentPosts.map((product) => (
              <Col key={product.slug} sm={12} md={6} lg={3} className="mb-3">
                <Product product={product} />
              </Col>
            ))}
          </Row>
        )}
        {/* Render the pagination component */}
        <Pagination
          totalPosts={productList.length}
          postsPerPage={postsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default HomePage;
