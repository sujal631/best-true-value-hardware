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

  // Function to format date string to show only the first 10 characters
  function formatDate(dateString) {
    return dateString.substring(0, 10);
  }

  // Function to determine if order is paid
  function isOrderPaid(order) {
    return order.paidAt || order.isPaid;
  }

  // Function to determine if order is ready for pickup
  function isOrderReadyForPickup(order) {
    return order.isPickupReady;
  }

  // Render page content
  return (
    <div>
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <h1 className="my-3">Orders</h1>
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
              <th className="btn-text">ORDER ID</th>
              <th className="btn-text">ORDER TOTAL</th>
              <th className="btn-text">DATE ORDERED</th>
              <th className="btn-text">PAID</th>
              <th className="btn-text">PICKUP READY</th>
              <th className="btn-text">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* ".sort" function sorts the orders array in reverse chronological order based on the "paidAt" field */}
            {/* Map over orders and create a row for each */}
            {orders
              .sort((a, b) => {
                if (!a.isPaid && !b.isPaid) return 0; // If both orders are unpaid, leave them in the same order
                if (!a.isPaid) return -1; // If "a" is unpaid, move it to the top
                if (!b.isPaid) return 1; // If "b" is unpaid, move it to the top
                return new Date(b.paidAt) - new Date(a.paidAt); // Sort the paid orders by paidAt date
              })
              .map((order) => (
                // Set to the "_id" field of each order to uniquely identify each row
                <tr key={order._id}>
                  <td className="btn-text">{order._id}</td>
                  <td className="btn-text">{order.totalPrice.toFixed(2)}</td>
                  <td className="btn-text">
                    {order.isPaid ? (
                      formatDate(order.paidAt)
                    ) : (
                      <span style={{ color: 'red', fontWeight: '600' }}>-</span>
                    )}
                  </td>
                  <td className="btn-text">
                    {isOrderPaid(order) ? (
                      <span style={{ color: 'green', fontWeight: '600' }}>
                        YES
                      </span>
                    ) : (
                      <span style={{ color: 'red', fontWeight: '600' }}>
                        NO
                      </span>
                    )}
                  </td>
                  <td className="btn-text">
                    {isOrderReadyForPickup(order) ? (
                      <span style={{ color: 'green', fontWeight: '600' }}>
                        YES
                      </span>
                    ) : (
                      <span style={{ color: 'red', fontWeight: '600' }}>
                        NO
                      </span>
                    )}
                  </td>
                  <td>
                    {/* Navigates to the OrderPage.js when the button is clicked */}
                    <Button
                      className="btn-text"
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
