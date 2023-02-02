import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image } from 'react-bootstrap';
import Rating from './Rating';

const Product = ({ product }) => (
  <Card>
    <Link to={`/product/${product.slug}`}>
      <Image src={product.image} className="card-img-top" alt={product.name} />
    </Link>
    <Card.Body>
      <Link to={`/product/${product.slug}`} className="remove-link-style">
        <Card.Title>{product.name}</Card.Title>
      </Link>
      <Rating rating={product.rating} numReviews={product.numReviews} />
      <Card.Text>${product.price}</Card.Text>
      <Button variant="primary">Add to cart</Button>
    </Card.Body>
  </Card>
);

export default Product;
