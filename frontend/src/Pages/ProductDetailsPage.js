import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Col, ListGroup, Badge, Card, Button, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Rating from '../Components/Rating';
import { Helmet } from 'react-helmet-async';
import { getErrorMessage } from '../utils';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';

const ProductDetailsPage = () => {
  // useParams hook to retrieve the product's slug from the URL
  const { slug } = useParams();
  // useState hook to store the product data, loading state, and error message
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect hook to fetch the product data based on the slug
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/products/slug/${slug}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setLoading(false);
      });
  }, [slug]);

  // Conditionally render the LoadingComponent, MessageComponent, or the product details
  if (loading) return <LoadingSpinner />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <>
      {/* Update the page title with the product name */}
      <Helmet>
        <title>{product.name}</title>
      </Helmet>
      <Row>
        <Col md={5}>
          {/* Display the product image */}
          <img className="img-large" src={product.image} alt={product.name} />
        </Col>
        <Col md={7}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              {/* Display the product name and rating */}
              <h3>{product.name}</h3>
              <Rating rating={product.rating} numReviews={product.numReviews} />
              <br />
              {/* Display the product price */}
              <strong>Price: ${product.price}</strong>
              <br />
              {/* Display the product description */}
              <strong>Description:</strong>
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                {/* Display the product price */}
                <ListGroup.Item>
                  <strong>Price: ${product.price}</strong>
                </ListGroup.Item>
                {/* Display the product availability */}
                <ListGroup.Item>
                  <strong>Availability: </strong>
                  {/* Conditionally render the availability badge based on product stock */}
                  {product.countInStock > 0 ? (
                    <Badge bg="success">In Stock</Badge>
                  ) : (
                    <Badge bg="danger">Out of Stock</Badge>
                  )}
                </ListGroup.Item>
                {/* Only show the add to cart button if there is stock */}
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-flex justify-content-center">
                      {/* Add to Cart button */}
                      <Button variant="primary">Add to Cart</Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
export default ProductDetailsPage;
