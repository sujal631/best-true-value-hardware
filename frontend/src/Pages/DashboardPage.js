import React, { useContext, useEffect, useReducer } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FAILURE',
          payload: getErrorMessage(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);

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
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.users && summary.users[0]
                      ? summary.users[0].numUsers
                      : 0}
                  </Card.Title>
                  <Card.Text style={{ color: '#bb0000' }}>
                    Total Users
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>
                  <Card.Text style={{ color: '#bb0000' }}>
                    Total Orders
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    $
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].totalSales.toFixed(2)
                      : 0}
                  </Card.Title>
                  <Card.Text style={{ color: '#bb0000' }}>
                    Total Earnings
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <div className="my-3">
            <h2>Sales</h2>
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

          <div className="my-3">
            <h2>New/Returning Customers</h2>
            {summary.newReturningCustomers.length === 0 ? (
              <Message variant="danger">No Data</Message>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Customer Type', 'Count'],
                  ...summary.newReturningCustomers.map((x) => [x._id, x.count]),
                ]}
              ></Chart>
            )}
          </div>
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
                  ...summary.revenueByDepartment.map((x) => [x._id, x.revenue]),
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
        </>
      )}
    </div>
  );
}
