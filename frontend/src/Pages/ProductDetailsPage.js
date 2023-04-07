//Import necessary modules and dependencies
import axios from 'axios';
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useReducer,
} from 'react';
import {
  Col,
  ListGroup,
  Badge,
  Card,
  Button,
  Row,
  Form,
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Rating from '../Components/Rating';
import { Helmet } from 'react-helmet-async';
import { getErrorMessage } from '../utils';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';
import ReactModal from 'react-modal';
import { toast } from 'react-toastify';
import StarRatings from 'react-rating-stars-component';
import ReviewComponent from '../Components/Review';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH':
      return { ...state, product: action.payload };
    case 'REVIEW_REQUEST':
      return { ...state, loadingReview: true };
    case 'REVIEW_SUCCESS':
      return { ...state, loadingReview: false };
    case 'REVIEW_FAILURE':
      return { ...state, loadingReview: false };
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const ProductDetailsPage = () => {
  let customerReviews = useRef();

  const navigate = useNavigate();
  // useParams hook to retrieve the product's slug from the URL
  const { slug } = useParams();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [refresh, setRefresh] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [{ loading, error, product, loadingReview }, dispatch] = useReducer(
    reducer,
    {
      product: [],
      loading: true,
      error: '',
    }
  );

  const openReviewModal = () => {
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
  };

  const userHasWrittenReview = () => {
    if (!userInfo) return false;
    return product.reviews.some((review) => review.user === userInfo._id);
  };

  const reviewCustomStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: '300px',
      maxWidth: '800px',
      height: '620px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
  };

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
    const fetchData = async () => {
      dispatch({ type: 'REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FAILURE', payload: getErrorMessage(err) });
      }
    };
    fetchData();
  }, [slug, refresh]);

  // Access the state and dispatch from the Store context
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

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

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please enter a rating for this product.');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          title,
          comment,
          name: `${userInfo.firstName} ${userInfo.lastName}`,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: 'REVIEW_SUCCESS',
      });
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH', payload: product });
      setRating(0); // Reset rating
      setTitle(''); // Reset title
      setComment(''); // Reset comment
      closeReviewModal(); // Close the review modal
      window.scrollTo({
        behavior: 'smooth',
        top: customerReviews.current.offsetTop,
      });
      setRefresh(!refresh);
    } catch (error) {
      toast.error(getErrorMessage(error));
      dispatch({ type: 'REVIEW_FAILURE' });
    }
  };
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
              <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
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
      <div className="mt-5">
        <h4 ref={customerReviews}>Customer Reviews</h4>
        <div className="my-3">
          {userInfo && !userHasWrittenReview() ? (
            <>
              <div>
                <Button
                  variant="primary"
                  onClick={openReviewModal}
                  className="mb-2"
                >
                  Write a Review
                </Button>
              </div>
              <ReactModal
                isOpen={showReviewModal}
                onRequestClose={closeReviewModal}
                style={reviewCustomStyles}
              >
                <form onSubmit={handleSubmitForm}>
                  <h4>Write a review: </h4>
                  <Form.Group className="mb-3" controlId="rating">
                    <Form.Label>
                      <strong>How would you rate this product?</strong>
                    </Form.Label>
                    <StarRatings
                      count={5}
                      value={rating}
                      onChange={(newRating) => setRating(newRating)}
                      size={48}
                      activeColor="#bb0000"
                      isHalf={false}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="reviewTitle">
                    <Form.Label>
                      <strong>Title your review</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="What's most important to know?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    ></Form.Control>
                  </Form.Group>
                  <Form.Label>
                    <strong>Write your review</strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="What did you like or dislike? What did you use this product for?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ minHeight: '200px' }}
                  ></Form.Control>

                  <div className="mt-4 d-flex justify-content-center gap-5">
                    <Button
                      disabled={loadingReview}
                      type="submit"
                      variant="warning"
                    >
                      CONFIRM
                    </Button>
                    <Button onClick={closeReviewModal}>CANCEL</Button>
                    {loadingReview && <LoadingSpinner />}
                  </div>
                </form>
              </ReactModal>
            </>
          ) : userInfo ? (
            <></>
          ) : (
            <Message variant="warning">
              You need to{' '}
              <Link to="/login" className="remove-link-style">
                <strong>LOG IN</strong>{' '}
              </Link>
              to review this product.
            </Message>
          )}
        </div>
        <ReviewComponent
          reviews={product.reviews}
          userInfo={userInfo}
          productId={product._id}
          token={userInfo?.token}
        />
      </div>
    </>
  );
};

export default ProductDetailsPage;
