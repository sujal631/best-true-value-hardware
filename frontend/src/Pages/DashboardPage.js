import React from 'react';
import { Helmet } from 'react-helmet-async';

// DashboardPage component to display the dashboard page of the application
const DashboardPage = () => {
  return (
    <div>
      {/* Helmet component to update the title of the page */}
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      {/* Main heading for the Dashboard page */}
      <h1>Welcome to the Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
