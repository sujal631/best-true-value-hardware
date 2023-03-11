// Import necessary dependencies
import { createContext, useReducer } from 'react';

// Create a context
export const Store = createContext();

// Set initial state with values from local storage or default values
const initialState = {
  userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  cart: {
    shippingInfo: JSON.parse(localStorage.getItem('shippingInfo') || '{}'),
    paymentMethod: localStorage.getItem('paymentMethod') || '',
    cartItems: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  },
};

// Define reducer function to handle state changes based on dispatched actions
function reducer(state, action) {
  switch (action.type) {
    // Add item to cart and update local storage
    case 'ADD_ITEM': {
      const newItem = action.payload;
      // Find the index of an item in the cart that matches the new item.
      const existingItemIndex = state.cart.cartItems.findIndex(
        (item) => item._id === newItem._id
      );

      // If the new item is already in the cart, replace it with the new one.
      // If the new item is not in the cart, add it to the cart.
      const updatedCartItems =
        existingItemIndex !== -1
          ? state.cart.cartItems.map((item, index) =>
              index === existingItemIndex ? newItem : item
            )
          : [...state.cart.cartItems, newItem];
      // Store the updated cart items in the local storage.
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      // Return a new state object with updated cart items.
      return { ...state, cart: { ...state.cart, cartItems: updatedCartItems } };
    }
    // Remove item from cart and update local storage
    case 'REMOVE_ITEM': {
      // Extract the item to be removed from the payload of the action
      const itemToRemove = action.payload;
      // Create a new array of cart items by filtering out the item to be removed
      const remainingCartItems = state.cart.cartItems.filter(
        (item) => item._id !== itemToRemove._id
      );
      // Save the updated cart items  to localStorage
      localStorage.setItem('cartItems', JSON.stringify(remainingCartItems));
      // Return a new state object with updated cart items.
      return {
        ...state,
        cart: { ...state.cart, cartItems: remainingCartItems },
      };
    }
    // Clear cart and remove cart items from local storage
    case 'CLEAR': {
      localStorage.removeItem('cartItems');
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    }
    // Set user info in state and local storage
    case 'LOGIN': {
      const userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      return { ...state, userInfo };
    }
    case 'LOGOUT': {
      // Remove user info and cart items from local storage and reset state
      localStorage.removeItem('userInfo');
      localStorage.removeItem('cartItems');
      return {
        ...state,
        userInfo: null,
        cart: {
          ...state.cart,
          cartItems: [],
          shippingInfo: {},
          paymentMethod: '',
        },
      };
    }
    // Set shipping info in state and local storage
    case 'SET_SHIPPING_INFO': {
      const shippingInfo = action.payload;
      localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
      return { ...state, cart: { ...state.cart, shippingInfo } };
    }
    // Set payment method in state and local storage
    case 'SET_PAYMENT_METHOD': {
      const paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', paymentMethod);
      return { ...state, cart: { ...state.cart, paymentMethod } };
    }
    default:
      return state;
  }
}

// Create a provider component to wrap app and provide access to state and dispatch
export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // The value object contains the current state and the function to dispatch actions.
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
