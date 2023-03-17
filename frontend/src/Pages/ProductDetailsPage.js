//Import necessary modules and dependencies
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { Col, ListGroup, Badge, Card, Button, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Rating from '../Components/Rating';
import { Helmet } from 'react-helmet-async';
import { getErrorMessage } from '../utils';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';
import ReactModal from 'react-modal';

const ProductDetailsPage = () => {
  const navigate = useNavigate();
  // useParams hook to retrieve the product's slug from the URL
  const { slug } = useParams();
  // useState hook to store the product data, loading state, and error message
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
      maxWidth: '400px',
      height: '200px',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
  };

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

  // Access the state and dispatch from the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;

  // Function to check the stock availability of a product
  const checkStockAvailability = async (productId, quantity) => {
    // Fetch the product details using its ID
    const { data } = await axios.get(`/api/products/${productId}`);
    // Return true if the available stock is greater than or equal to the requested quantity
    return data.countInStock >= quantity;
  };

  const addToBag = async () => {
    // Find if the product already exists in the cart
    const existingItem = cart.cartItems.find((x) => x._id === product._id);
    // Calculate the updated quantity of the product
    const quantity = existingItem ? existingItem.quantity + 1 : 1;

    // Check if the stock is available for the updated quantity
    const isStockAvailable = await checkStockAvailability(
      product._id,
      quantity
    );

    // If the stock is not available, show an alert and return
    if (!isStockAvailable) {
      setModalIsOpen(true);
      return;
    }

    // If the stock is available, dispatch the 'ADD_ITEM' action with the updated product details
    ctxDispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });
    // Navigate to the cart page
    navigate('/cart');
  };

  // Conditionally render the LoadingComponent, MessageComponent, or the product details
  if (loading) return <LoadingSpinner />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <>
      {/* Update the page title with the product name */}
      <Helmet>
        <title>{product.name}</title>
      </Helmet>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={customStyles}
      >
        <strong>
          <p>Out of Stock</p>
        </strong>
        <p>Sorry, this product is out of stock.</p>
        <Button variant="primary" onClick={() => setModalIsOpen(false)}>
          Close
        </Button>
      </ReactModal>
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
                <ListGroup.Item>
                  <div className="d-flex justify-content-center">
                    {/* Add to Cart button */}
                    <Button onClick={addToBag} variant="primary">
                      ADD TO BAG
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductDetailsPage;
