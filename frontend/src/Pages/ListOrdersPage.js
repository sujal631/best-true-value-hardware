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

const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return {
        ...state,
        orders: action.payload.orders.sort(
          (a, b) => a.isPickupReady - b.isPickupReady
        ),
        pages: action.payload.pages,
        loading: false,
      };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// A functional component that returns the page content for List Orders page
const ListOrdersPage = () => {
  const [{ loading, error, orders, pages }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  const location = useLocation();
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPickupReadyFilter, setIsPickupReadyFilter] = useState('');

  const fetchOrders = (page, limit, token, searchTerm, isPickupReadyFilter) => {
    return axios.get(
      `/api/orders/admin?page=${page}&limit=${limit}&searchTerm=${searchTerm}&isPickupReadyFilter=${isPickupReadyFilter}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const setCurrentPageAndUpdateUrl = (pageNumber) => {
    setCurrentPage(pageNumber);
    navigate(`${location.pathname}?page=${pageNumber}`, { replace: true });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const parsed = queryString.parse(location.search);
    const pageFromUrl = parsed.page ? parseInt(parsed.page, 10) : 1;
    const pageFromState = location.state?.currentPage || pageFromUrl;

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
                <td className="btn-text">{order.paidAt.substring(0, 10)}</td>
                <td className="btn-text">
                  {order.isPickupReady ? (
                    <span style={{ color: 'green', fontWeight: '600' }}>
                      YES
                    </span>
                  ) : (
                    <span style={{ color: 'red', fontWeight: '600' }}>NO</span>
                  )}
                </td>
                <td>
                  <Button
                    className="btn-text"
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
