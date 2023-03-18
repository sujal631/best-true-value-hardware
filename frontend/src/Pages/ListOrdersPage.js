import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import axios from 'axios';
import { getErrorMessage } from '../utils';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// A functional component that returns the page content for List Orders page
const ListOrdersPage = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FAILURE', payload: getErrorMessage(error) });
      }
    };
    fetchData();
  }, [userInfo]);
  return (
    <div>
      {/* Set the title of the page dynamically in the browser tab */}
      <Helmet>
        <title>Orders</title>
      </Helmet>

      {/* Page header */}
      <h1>Orders</h1>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th className="btn-text">ORDER ID</th>
              <th className="btn-text">CUSTOMER NAME</th>
              <th className="btn-text">ORDER TOTAL </th>
              <th className="btn-text">DATE ORDERED</th>
              <th className="btn-text">PICKUP READY</th>
              <th className="btn-text">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="btn-text">{order._id}</td>
                <td className="btn-text">
                  {order.user
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : 'NOT AVAILABLE'}
                </td>
                <td className="btn-text">{order.totalPrice.toFixed(2)}</td>
                <td className="btn-text">{order.createdAt.substring(0, 10)}</td>
                <td className="btn-text">
                  {order.isPickupReady ? 'YES' : 'NO'}
                </td>
                <td className="btn-text">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      navigate(`/order/${order._id}`);
                    }}
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
};

export default ListOrdersPage;
