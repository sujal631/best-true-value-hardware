// Import necessary modules and components
import axios from 'axios';
import React, { useEffect, useState, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';

// Main component
export default function OrderHistoryPage() {
  // Get user info from global state
  const {
    state: { userInfo },
  } = useContext(Store);
  const navigate = useNavigate();
  // Initialize state with useState hook
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  // Fetch data from API using useEffect hook
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Make GET request to API with user token
        const { data } = await axios.get(`/api/orders/mine`, {
          headers: { Authorization: `Bearer ${userInfo.token} ` },
        });
        setOrders(data);
      } catch (error) {
        setError(getErrorMessage(error));
      }
      setLoading(false);
    };
    fetchData();
  }, [userInfo]);

  // Function to handle click event and navigate to order details page
  const handleDetailsClick = (id) => navigate(`/order/${id}`);

  // Render page content
  return (
    <div>
      <Helmet>
        <title>Order History</title>
      </Helmet>
      <h1 className="my-3">Order History</h1>
      {/* Show loading spinner if data is being fetched or Show error message if data fetch fails */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              {/* Table headers that describe the columns in the table that displays order history */}
              <th>ORDER ID</th>
              <th>DATE ORDERED</th>
              <th>ORDER TOTAL</th>
              <th>PAID ON</th>
              <th>PICKUP READY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* ".sort" function sorts the orders array in reverse chronological order based on the "createdAt" field */}
            {/* Map over orders and create a row for each */}
            {orders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                // Set to the "_id" field of each order to uniquely identify each row
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.totalPrice.toFixed(2)}</td>
                  <td>
                    {order.paidAt
                      ? order.paidAt.substring(0, 10)
                      : order.isPaid
                      ? 'Yes'
                      : 'No'}
                  </td>
                  <td>{order.isPickupReady ? 'Yes' : 'No'}</td>
                  <td>
                    {/* Navigates to the OrderPage.js when the button is clicked */}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleDetailsClick(order._id)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
