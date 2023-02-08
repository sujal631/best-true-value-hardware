import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

// Pages
import HomePage from './Pages/HomePage';
import ProductPage from './Pages/ProductPage';
import ShoppingCartPage from './Pages/ShoppingCartPage';
import LogInPage from './Pages/LogInPage';
import RegistrationPage from './Pages/RegistrationPage';
import ShippingInfoPage from './Pages/ShippingInfoPage';
import PaymentPage from './Pages/PaymentPage';
import PreviewOrderPage from './Pages/PreviewOrderPage';
import OrderHistoryPage from './Pages/OrderHistoryPage';
import ProfilePage from './Pages/ProfilePage';
import SearchPage from './Pages/SearchPage';
import DashboardPage from './Pages/DashboardPage';
import ListProductsPage from './Pages/ListProductsPage';
import ListOrdersPage from './Pages/ListOrdersPage';
import ListUsersPage from './Pages/ListUsersPage';
import EditProductPage from './Pages/EditProductPage';
import AllDepartmentsPage from './Pages/AllDepartmentsPage';
import AboutPage from './Pages/AboutPage';

// Components
import Navigation from './Components/Navigation';
import Footer from './Components/Footer';

// Main App component that contains all the routes
const App = () => {
  return (
    <BrowserRouter>
      <div className="site-container">
        {/* Header with Navbar as Navigation */}
        <header>
          <Navigation />
        </header>
        {/* Main content section */}
        <main className="main-section">
          <Container>
            {/* All the routes defined here */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/allDepartments" element={<AllDepartmentsPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<ShoppingCartPage />} />
              <Route path="/login" element={<LogInPage />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/shippingInfo" element={<ShippingInfoPage />} />
              <Route path="/paymentMethod" element={<PaymentPage />} />
              <Route path="/previewOrder" element={<PreviewOrderPage />} />
              <Route path="/orderHistory" element={<OrderHistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/listProducts" element={<ListProductsPage />} />
              <Route path="/listOrders" element={<ListOrdersPage />} />
              <Route path="/listUsers" element={<ListUsersPage />} />
              <Route path="/editProduct" element={<EditProductPage />} />
            </Routes>
          </Container>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
