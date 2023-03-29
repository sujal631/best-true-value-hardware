//Import necessary modules
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import { Row, Col, Card } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

// Define the default state of the reducer
const initialState = {
  loading: true,
  error: '',
  dashboard: null,
};

// Map the action types to specific functions to update the state
const actionsMap = {
  // Update the loading state to true
  REQUEST: (state) => ({ ...state, loading: true }),
  // Update the dashboard state and set the loading state to false
  SUCCESS: (state, action) => ({
    ...state,
    dashboard: action.payload,
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
  const updateState = actionsMap[action.type];
  return updateState ? updateState(state, action) : state;
};

export default function DashboardPage() {
  // State variables and dispatch function created using useReducer hook
  const [{ loading, dashboard, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  // Accessing userInfo from the global store using useContext hook
  const { state } = useContext(Store);
  const { userInfo } = state;

  // Local state variables for time range and top selling products
  const [timeRange, setTimeRange] = useState('daily');
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  // Fetch dashboard data and top selling products data from the server when the component mounts or when timeRange or userInfo changes
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(
          `/api/orders/dashboard?timeRange=${timeRange}`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        const { data: topSellingData } = await axios.get(
          '/api/orders/top-selling-products',
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setTopSellingProducts(topSellingData);

        // Dispatch a SUCCESS action with fetched data
        dispatch({ type: 'SUCCESS', payload: data });
      } catch (err) {
        // Dispatch a FAILURE action with error message
        dispatch({
          type: 'FAILURE',
          payload: getErrorMessage(err),
        });
      }
    }
    fetchData();
  }, [userInfo, timeRange]);

  //Component for rendering a summary card with a title, value, and optional child components
  const SummaryCard = ({
    title,
    value,
    textColor,
    backgroundColor,
    children,
  }) => (
    <Card>
      <Card.Body style={{ backgroundColor: backgroundColor }}>
        <Card.Title>{value}</Card.Title>
        <Card.Text style={{ color: textColor }}>{title}</Card.Text>
        {children}
      </Card.Body>
    </Card>
  );

  // Render the dashboard page with summary cards and charts
  return (
    <div>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <h1>Dashboard</h1>
      {loading ? (
        <LoadingSpinner /> // Show loading spinner if data is still being fetched
      ) : error ? (
        <Message variant="danger">{error}</Message> // Show error message if there was an error fetching data
      ) : (
        <>
          <Row className="mb-2">
            <Col md={4}>
              <SummaryCard
                title="Total Users"
                value={
                  dashboard.users && dashboard.users[0]
                    ? dashboard.users[0].numUsers
                    : 0
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
            <Col md={4}>
              <SummaryCard
                title="New Customers"
                value={
                  dashboard.newReturningCustomers
                    ? dashboard.newReturningCustomers
                        // Filter customers with id 'New Customer'
                        .filter((customer) => customer._id === 'New Customer')
                        .map((customer) => customer.count)
                        // Calculate the total count of new customers
                        .reduce((acc, val) => acc + val, 0)
                    : 0
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>

            <Col md={4}>
              <SummaryCard
                title="Returning Customers"
                value={
                  dashboard.newReturningCustomers
                    ? dashboard.newReturningCustomers
                        // Filter customers with id 'Returning Customer'
                        .filter(
                          (customer) => customer._id === 'Returning Customer'
                        )
                        .map((customer) => customer.count)
                        // Calculate the total count of returning customers
                        .reduce((acc, val) => acc + val, 0)
                    : 0
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={3}>
              <SummaryCard
                title="Total Orders"
                value={
                  dashboard.orders && dashboard.users[0]
                    ? // Get the total number of orders from the first element of the 'orders' array
                      dashboard.orders[0].numOrders
                    : 0
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
            <Col md={3}>
              <SummaryCard
                title="Orders in the Last 24 Hours"
                value={
                  dashboard.dailyOrders
                    ? dashboard.dailyOrders
                        // Filter orders that were made in the last 24 hours
                        .filter((dailyOrder) => {
                          const today = new Date();
                          const yesterday = new Date(today);
                          yesterday.setDate(today.getDate() - 1);
                          const orderDate = new Date(dailyOrder._id);
                          return orderDate > yesterday;
                        })
                        .map((dailyOrder) => dailyOrder.orders)
                        // Calculate the total number of orders made in the last 24 hours
                        .reduce((acc, val) => acc + val, 0)
                    : 0
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
            <Col md={3}>
              <SummaryCard
                title="Total Earnings"
                value={`${
                  dashboard.orders && dashboard.users[0]
                    ? // Get the total sales from the first element of the 'orders' array and format it to 2 decimal places
                      dashboard.orders[0].totalSales.toFixed(2)
                    : 0
                }`}
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>

            <Col md={3}>
              <SummaryCard
                title="Average Order Value"
                value={`${
                  dashboard.orders &&
                  dashboard.users[0] &&
                  dashboard.orders[0].numOrders > 0
                    ? // Calculate the average order value from the first element of the 'orders' array and format it to 2 decimal places
                      (
                        dashboard.orders[0].totalSales /
                        dashboard.orders[0].numOrders
                      ).toFixed(2)
                    : 0
                }`}
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={6}>
              <SummaryCard
                title="Total Products"
                value={
                  dashboard.productDepartments
                    ? dashboard.productDepartments
                        .map((department) => department.count)
                        // Calculate the total number of products
                        .reduce((acc, val) => acc + val, 0)
                    : 0
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
            <Col md={6}>
              <SummaryCard
                title="Top Selling Department"
                value={
                  // Get the department with the highest revenue
                  dashboard.revenueByDepartment &&
                  dashboard.revenueByDepartment[0]
                    ? dashboard.revenueByDepartment[0]._id
                    : 'N/A'
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
          </Row>

          <Row>
            {/* Displays the daily sales performance over a selected time range */}
            <Col md={12}>
              <div className="my-3">
                <h2>Sales</h2>
                <div className="d-flex align-items-center mb-3">
                  <span className="mr-2">Filter by: &emsp;</span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="form-control w-auto"
                  >
                    {/* A dropdown menu to select a time range option, and the chart updates accordingly */}
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="all">All</option>
                  </select>
                </div>
                {dashboard.dailyOrders.length === 0 ? (
                  <Message variant="danger">No Data</Message>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="AreaChart"
                    loader={<div>Loading...</div>}
                    data={[
                      ['Date', 'Sales'],
                      ...dashboard.dailyOrders.map((x) => [x._id, x.sales]),
                    ]}
                    options={{
                      title: 'Sales Performance',
                      colors: ['#bb0000'],
                      backgroundColor: 'transparent',
                      chartArea: {
                        backgroundColor: 'transparent',
                      },
                      legend: { position: 'none' },
                    }}
                  ></Chart>
                )}
              </div>
            </Col>

            {/* Chart displaying top five selling products by revenue */}
            <Col md={12}>
              <div className="my-3">
                <h2>Top Selling Products</h2>
                {topSellingProducts.length === 0 ? (
                  <Message variant="danger">No Data</Message>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="ColumnChart"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      // Sort the products based on their total revenue in descending order and take only the first 5 products with the highest revenue
                      ['Product', 'Revenue'],
                      ...topSellingProducts
                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                        .slice(0, 5)
                        .map((x) => [x.product.name, x.totalRevenue]),
                    ]}
                    options={{
                      title: 'Top Selling Products by Revenue',
                      colors: ['#bb0000'],
                      backgroundColor: 'transparent',
                      chartArea: {
                        backgroundColor: 'transparent',
                      },
                      legend: { position: 'none' },
                    }}
                  ></Chart>
                )}
              </div>
            </Col>
          </Row>

          <Row>
            {/* Chart displaying the inventory breakdown by department */}
            <Col md={6}>
              <div className="my-3">
                <h2>Departments</h2>
                {dashboard.productDepartments.length === 0 ? (
                  <Message variant="danger">No Data</Message>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="ColumnChart"
                    loader={<div>Loading...</div>}
                    data={[
                      ['Department', 'Products'],
                      ...dashboard.productDepartments
                        .map((x) => [x._id || 'Unknown', x.count])
                        // Sort in alphabetical order based on the department name
                        .sort((a, b) =>
                          a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1
                        ),
                    ]}
                    options={{
                      title: 'Inventory Breakdown by Department',
                      colors: ['#bb0000'],
                      backgroundColor: 'transparent',
                      chartArea: {
                        backgroundColor: 'transparent',
                      },
                      legend: { position: 'none' },
                    }}
                  ></Chart>
                )}
              </div>
            </Col>

            {/* Chart displaying the revenue breakdown by department */}
            <Col md={6}>
              <div className="my-3">
                <h2>Revenue by Department</h2>
                {dashboard.revenueByDepartment.length === 0 ? (
                  <Message variant="danger">No Data</Message>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="ColumnChart"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ['Department', 'Revenue'],
                      ...dashboard.revenueByDepartment
                        .map((x) => [x._id, x.revenue])
                        // Sort in alphabetical order based on the department name
                        .sort((a, b) =>
                          a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1
                        ),
                    ]}
                    options={{
                      title: 'Revenue by Department',
                      colors: ['#bb0000'],
                      backgroundColor: 'transparent',
                      chartArea: {
                        backgroundColor: 'transparent',
                      },
                      legend: { position: 'none' },
                    }}
                  ></Chart>
                )}
              </div>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
