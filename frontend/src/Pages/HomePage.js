import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col } from 'react-bootstrap';
import Product from '../Components/Product';
import Slider from '../Components/Slider';
import { Helmet } from 'react-helmet-async';
import Message from '../Components/MessageComponent';
import LoadingSpinner from '../Components/LoadingComponent';

const HomePage = () => {
  // State to keep track of loading and error status
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // State to store the list of products
  const [productList, setProductList] = useState([]);

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

  return (
    <div>
      {/* Set the title of the page */}
      <Helmet>
        <title>Best True Value Hardware</title>
      </Helmet>
      {/* Render the slider component */}
      <Slider />
      {/* Display the title for the product list */}
      <h1>Sample Products</h1>
      <div className="product-container">
        {/* Conditionally render the loading component if the data is being fetched, error component if there is an error, or the product list if the data is available */}
        {isLoading ? (
          <LoadingSpinner />
        ) : errorMessage ? (
          <Message variant="danger">{errorMessage}</Message>
        ) : (
          <Row>
            {productList.map((product) => (
              <Col key={product.slug} sm={12} md={6} lg={3} className="mb-3">
                <Product product={product} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default HomePage;
