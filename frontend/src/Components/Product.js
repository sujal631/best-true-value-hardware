// Import React and the required UI components from react-bootstrap library
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Image } from 'react-bootstrap';
import Rating from './Rating';
import axios from 'axios';
import { Store } from '../Store';
import ReactModal from 'react-modal';

const Product = ({ product }) => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

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
      borderRadius: '8px',
      border: '1px solid #ccc',
    },
  };

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
      setModalIsOpen(true);
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
    <>
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
    </>
  );
};

//Export the product
export default Product;
