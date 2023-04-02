// Import necessary modules and components
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import axios from 'axios';
import { getErrorMessage } from '../utils';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import { Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import AdminPagination from '../Components/AdminPagination.js';
import { BiSearch } from 'react-icons/bi';

// Define the default state of the reducer
const initialState = {
  loading: true,
  error: '',
  orders: [],
  pages: 0,
};

// Map the action types to specific functions to update the state
const actionsMap = {
  // Update the loading state to true
  REQUEST: (state) => ({ ...state, loading: true }),
  // Sorts the orders by whether they are ready for pickup or not, and set the loading state to false
  SUCCESS: (state, action) => ({
    ...state,
    orders: action.payload.orders,
    pages: action.payload.pages,
    loading: false,
  }),
  // Update the error state and set the loading state to false
  FAILURE: (state, action) => ({
    ...state,
    loading: false,
    error: action.payload,
  }),
};

// Reducer function for handling state updates based on dispatched actions
const reducer = (state = initialState, action) => {
  // Find the matching function for the action type, or return the state if no matching function is found
  const updateState = actionsMap[action.type];
  return updateState ? updateState(state, action) : state;
};

// A functional component that returns the page content for List Orders page
const ListOrdersPage = () => {
  // Destructuring the state variables from the reducer
  const [{ loading, error, orders, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Getting the user information from the context
  const { userInfo } = useContext(Store).state;
  // Defining necessary variables and functions
  const navigate = useNavigate();
  const location = useLocation();
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPickupReadyFilter, setIsPickupReadyFilter] = useState('');

  // Function to fetch orders
  const fetchOrders = (page, limit, token, searchTerm, isPickupReadyFilter) => {
    return axios.get(
      `/api/orders/admin?page=${page}&limit=${limit}&searchTerm=${searchTerm}&isPickupReadyFilter=${isPickupReadyFilter}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  // Function to set the current page and update the URL
  const setCurrentPageAndUpdateUrl = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`${location.pathname}?page=${pageNumber}`, { replace: true });
  };

  // Fetching the orders when the component mounts and when any dependency changes
  useEffect(() => {
    window.scrollTo(0, 0);
    // Getting the current page from the URL or the state
    const parsed = queryString.parse(location.search);
    const pageFromUrl = parsed.page ? parseInt(parsed.page, 10) : 1;
    const pageFromState = location.state?.currentPage || pageFromUrl;

    // Fetching the orders
    const fetchData = async () => {
      try {
        dispatch({ type: 'REQUEST' });
        const { data } = await fetchOrders(
          currentPage,
          pageSize,
          userInfo.token,
          searchTerm,
          isPickupReadyFilter
        );
        dispatch({
          type: 'SUCCESS',
          payload: { orders: data.orders, pages: data.pages },
        });
      } catch (error) {
        dispatch({ type: 'FAILURE', payload: getErrorMessage(error) });
      }
    };
    // Checking if the current page needs to be updated or the orders need to be fetched
    if (currentPage !== pageFromState) {
      setCurrentPage(pageFromState);
    } else {
      fetchData();
    }
  }, [currentPage, location, userInfo, searchTerm, isPickupReadyFilter]);

  return (
    <div>
      {/* Set the title of the page dynamically in the browser tab */}
      <Helmet>
        <title>Orders</title>
      </Helmet>

      {/* Page header */}
      <h1>Orders</h1>

      <Row>
        {/* Search input */}
        <Col md={4} className="my-3">
          <InputGroup>
            <InputGroup.Text>
              <BiSearch />
            </InputGroup.Text>
            <Form.Control
              id="search"
              type="text"
              placeholder="Search by Customer's name ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control "
            />
          </InputGroup>
        </Col>
        {/* Filter by Pickup status */}
        <Col md={3} className="my-3">
          <div>
            <select
              id="isPickupReadyFilter"
              value={isPickupReadyFilter}
              onChange={(e) => setIsPickupReadyFilter(e.target.value)}
              className="form-control custom-select"
            >
              <option value="">Filter by PICKUP status</option>
              <option value="true">Pickup Ready</option>
              <option value="false">Not Ready</option>
            </select>
          </div>
        </Col>
      </Row>
      {/* Show loading spinner if loading, error message if there's an error, and table of orders otherwise */}
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
              <th className="btn-text">PHONE NUMBER</th>
              <th className="btn-text">ORDER TOTAL </th>
              <th className="btn-text">DATE ORDERED</th>
              <th className="btn-text">PICKUP READY</th>
              <th className="btn-text">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* Map through orders to create table rows */}
            {orders.map((order) => {
              const { _id, user, totalPrice, paidAt, isPickupReady } = order;
              const { firstName, lastName, phoneNumber } = user || {};
              const pickupStatusColor = isPickupReady ? 'green' : 'red';

              return (
                <tr key={_id}>
                  <td className="btn-text">{_id}</td>
                  <td className="btn-text">
                    {user ? `${firstName} ${lastName}` : 'NOT AVAILABLE'}
                  </td>
                  <td className="btn-text">{phoneNumber}</td>
                  <td className="btn-text">{totalPrice.toFixed(2)}</td>
                  <td className="btn-text">{paidAt.substring(0, 10)}</td>
                  <td className="btn-text">
                    <span
                      style={{ color: pickupStatusColor, fontWeight: '600' }}
                    >
                      {isPickupReady ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td>
                    <Button
                      className="btn-text"
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        navigate(`/order/${_id}`);
                      }}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Pagination component */}
      <div>
        <AdminPagination
          totalPages={pages}
          setCurrentPage={setCurrentPageAndUpdateUrl}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default ListOrdersPage;
