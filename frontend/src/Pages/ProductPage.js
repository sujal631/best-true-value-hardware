import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import { Col, ListGroup, Badge, Card, Button, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Rating from '../Components/Rating';
import LoadingComponent from '../Components/LoadingComponent';
import MessageComponent from '../Components/MessageComponent';
import { Helmet } from 'react-helmet-async';
import { getErrorMessage } from '../utils';

const ProductPage = () => {
  const params = useParams();
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'FETCH_START':
          return { ...state, loading: true };
        case 'FETCH_SUCCESS':
          return { ...state, product: action.payload, loading: false };
        case 'FETCH_ERROR':
          return { ...state, error: action.payload, loading: false };
        default:
          return state;
      }
    },
    { product: [], loading: true, error: '' }
  );

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    axios
      .get(`/api/products/slug/${params.slug}`)
      .then((res) => dispatch({ type: 'FETCH_SUCCESS', payload: res.data }))
      .catch((err) =>
        dispatch({ type: 'FETCH_ERROR', payload: getErrorMessage(err) })
      );
  }, [params.slug]);

  const { loading, error, product } = state;
  if (loading) return <LoadingComponent />;
  if (error)
    return <MessageComponent variant="danger">{error}</MessageComponent>;

  return (
    <>
      <Helmet>
        <title>{product.name}</title>
      </Helmet>
      <Row>
        <Col md={6}>
          <img className="img-large" src={product.image} alt={product.name} />
        </Col>
        <Col md={6}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>{product.name}</h3>
              <Rating rating={product.rating} numReviews={product.numReviews} />
              <br />
              <strong>Price: ${product.price}</strong>
              <br />
              <strong>Description:</strong>
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Price: ${product.price}</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>
                    Availability:
                    {product.countInStock > 0 ? (
                      <Badge bg="success"> In Stock</Badge>
                    ) : (
                      <Badge bg="danger"> Out of Stock</Badge>
                    )}
                  </strong>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button variant="primary"> Add to Cart</Button>
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
export default ProductPage;
