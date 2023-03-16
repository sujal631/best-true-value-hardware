import React, { useContext, useEffect, useReducer, useState } from 'react';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getErrorMessage } from '../utils';
import LoadingSpinner from '../Components/LoadingComponent';
import Message from '../Components/MessageComponent';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return { ...state, loading: true };
    case 'SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
export default function DashboardPage() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [timeRange, setTimeRange] = useState('daily');
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/orders/summary?timeRange=${timeRange}`,
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

        dispatch({ type: 'SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FAILURE',
          payload: getErrorMessage(err),
        });
      }
    };
    fetchData();
  }, [userInfo, timeRange]);

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

  return (
    <div>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <h1>Dashboard</h1>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row className="mb-2">
            <Col md={4}>
              <SummaryCard
                title="Total Users"
                value={
                  summary.users && summary.users[0]
                    ? summary.users[0].numUsers
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
                  summary.newReturningCustomers
                    ? summary.newReturningCustomers
                        .filter((customer) => customer._id === 'New Customer')
                        .map((customer) => customer.count)
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
                  summary.newReturningCustomers
                    ? summary.newReturningCustomers
                        .filter(
                          (customer) => customer._id === 'Returning Customer'
                        )
                        .map((customer) => customer.count)
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
                  summary.orders && summary.users[0]
                    ? summary.orders[0].numOrders
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
                  summary.dailyOrders
                    ? summary.dailyOrders
                        .filter((dailyOrder) => {
                          const today = new Date();
                          const yesterday = new Date(today);
                          yesterday.setDate(today.getDate() - 1);
                          const orderDate = new Date(dailyOrder._id);
                          return orderDate > yesterday;
                        })
                        .map((dailyOrder) => dailyOrder.orders)
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
                  summary.orders && summary.users[0]
                    ? summary.orders[0].totalSales.toFixed(2)
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
                  summary.orders &&
                  summary.users[0] &&
                  summary.orders[0].numOrders > 0
                    ? (
                        summary.orders[0].totalSales /
                        summary.orders[0].numOrders
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
                  summary.productDepartments
                    ? summary.productDepartments
                        .map((department) => department.count)
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
                  summary.revenueByDepartment && summary.revenueByDepartment[0]
                    ? summary.revenueByDepartment[0]._id
                    : 'N/A'
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={12}>
              <SummaryCard
                title="Highest Revenue Customer"
                value={
                  summary.highestRevenueCustomer &&
                  summary.highestRevenueCustomer[0] &&
                  summary.highestRevenueCustomer[0].user
                    ? `$${summary.highestRevenueCustomer[0].revenue.toFixed(2)}`
                    : 0
                }
                textColor="#bb0000"
                backgroundColor="#F0F0F0"
              >
                {summary.highestRevenueCustomer &&
                summary.highestRevenueCustomer[0] &&
                summary.highestRevenueCustomer[0].user ? (
                  <div>
                    <p>
                      Name: {summary.highestRevenueCustomer[0].user.firstName}{' '}
                      {summary.highestRevenueCustomer[0].user.lastName}
                    </p>
                    <p>Email: {summary.highestRevenueCustomer[0].user.email}</p>
                  </div>
                ) : (
                  <p>No customer data available</p>
                )}
              </SummaryCard>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="my-3">
                <h2>Sales</h2>
                <div className="d-flex align-items-center mb-3">
                  <span className="mr-2">Filter by: &emsp;</span>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="form-control w-auto"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="all">All</option>
                  </select>
                </div>
                {summary.dailyOrders.length === 0 ? (
                  <Message variant="danger">No Data</Message>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="AreaChart"
                    loader={<div>Loading...</div>}
                    data={[
                      ['Date', 'Sales'],
                      ...summary.dailyOrders.map((x) => [x._id, x.sales]),
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

            <Col md={6}>
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
            <Col md={6}>
              <div className="my-3">
                <h2>Departments</h2>
                {summary.productDepartments.length === 0 ? (
                  <Message variant="danger">No Data</Message>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="ColumnChart"
                    loader={<div>Loading...</div>}
                    data={[
                      ['Department', 'Products'],
                      ...summary.productDepartments
                        .map((x) => [x._id || 'Unknown', x.count])
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
            <Col md={6}>
              <div className="my-3">
                <h2>Revenue by Department</h2>
                {summary.revenueByDepartment.length === 0 ? (
                  <Message variant="danger">No Data</Message>
                ) : (
                  <Chart
                    width="100%"
                    height="400px"
                    chartType="ColumnChart"
                    loader={<div>Loading Chart...</div>}
                    data={[
                      ['Department', 'Revenue'],
                      ...summary.revenueByDepartment
                        .map((x) => [x._id, x.revenue])
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
