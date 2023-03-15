// Import React and the required UI components from react-bootstrap library
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image } from 'react-bootstrap';
import Rating from './Rating';
import axios from 'axios';
import { Store } from '../Store';

const Product = ({ product }) => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  // Function to fetch product details from the API
  const fetchProductDetails = async (productId) => {
    const { data } = await axios.get(`api/products/${productId}`);
    return data;
  };

  const addToBag = async (item) => {
    // Check if the product already exists in the cart
    const existingItem = cartItems.find((x) => x._id === product._id);

    // If the product exists in the cart, increment its quantity, otherwise set the quantity to 1
    const updatedItem = existingItem
      ? { ...existingItem, quantity: existingItem.quantity + 1 }
      : { ...item, quantity: 1 };

    // Fetch the product details from the API
    const productDetails = await fetchProductDetails(item._id);

    // Check if the product's available stock is sufficient for the updated quantity
    if (productDetails.countInStock < updatedItem.quantity) {
      window.alert('Sorry, this product is out of stock');
      return;
    }

    // If the stock is sufficient, dispatch the 'ADD_ITEM' action with the updated product details
    ctxDispatch({ type: 'ADD_ITEM', payload: updatedItem });
  };

  const OutOfStockButton = () => (
    <Button variant="primary" disabled>
      OUT OF STOCK
    </Button>
  );

  const AddToBagButton = ({ product, onAddToBag }) => (
    <Button variant="primary" onClick={() => onAddToBag(product)}>
      ADD TO BAG
    </Button>
  );

  return (
    <Card>
      {/* Link to the product details page with the specific product's slug */}
      <Link to={`/product/${product.slug}`}>
        <Image
          src={product.image}
          className="card-img-top"
          alt={product.name}
        />
      </Link>
      <Card.Body>
        {/* Link to the product details page with the specific product's slug, with a class to remove default link styles */}
        <Link to={`/product/${product.slug}`} className="remove-link-style">
          {/* Display the product's name */}
          <Card.Title>{product.name}</Card.Title>
        </Link>
        {/* Import and display the rating component with the current product's rating and number of reviews(hardcoded) */}
        <Rating rating={product.rating} numReviews={product.numReviews} />
        {/* Display the product's price */}
        <Card.Text>${product.price}</Card.Text>
        {/* Add to cart button */}
        {product.countInStock === 0 ? (
          <OutOfStockButton />
        ) : (
          <AddToBagButton product={product} onAddToBag={addToBag} />
        )}
      </Card.Body>
    </Card>
  );
};

//Export the product
export default Product;
