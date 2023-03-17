import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './Pages/HomePage';
import ProductDetailsPage from './Pages/ProductDetailsPage';
import ShoppingCartPage from './Pages/ShoppingCartPage';
import LogInPage from './Pages/LogInPage';
import RegistrationPage from './Pages/RegistrationPage';
import ShippingInfoPage from './Pages/ShippingInfoPage';
import PaymentPage from './Pages/PaymentPage';
import PreviewOrderPage from './Pages/PreviewOrderPage';
import OrderPage from './Pages/OrderPage';
import OrderHistoryPage from './Pages/OrderHistoryPage';
import ProfilePage from './Pages/ProfilePage';
import SearchPage from './Pages/SearchPage';
import DashboardPage from './Pages/DashboardPage';
import ListProductsPage from './Pages/ListProductsPage';
import ListOrdersPage from './Pages/ListOrdersPage';
import ListUsersPage from './Pages/ListUsersPage';
import EditProductPage from './Pages/EditProductPage';
import AboutPage from './Pages/AboutPage';

// Components
import Navigation from './Components/Navigation';
import Footer from './Components/Footer';
import ProductsPage from './Pages/ProductsPage';
import ScrollToTop from './Components/ScrollToTop';
import UserAuthorizedAccess from './Components/UserAuthorizedAccess';
import AdminAuthorizedAccess from './Components/AdminAuthorizedAccess';

// Main App component that contains all the routes
const App = () => {
  return (
    <BrowserRouter>
      <div className="site-container">
        <ToastContainer position="bottom-center" limit={1} />
        {/* Header with Navbar as Navigation */}
        <header>
          <Navigation />
          <ScrollToTop />
        </header>
        {/* Main content section */}
        <main className="main-section">
          <Container>
            {/* All the routes are defined here */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:slug" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<ShoppingCartPage />} />
              <Route path="/login" element={<LogInPage />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/shippingInfo" element={<ShippingInfoPage />} />
              <Route path="/paymentMethod" element={<PaymentPage />} />
              <Route path="/previewOrder" element={<PreviewOrderPage />} />
              <Route
                path="/order/:id"
                element={
                  <UserAuthorizedAccess>
                    <OrderPage />
                  </UserAuthorizedAccess>
                }
              />
              <Route
                path="/orderHistory"
                element={
                  <UserAuthorizedAccess>
                    <OrderHistoryPage />
                  </UserAuthorizedAccess>
                }
              />
              <Route
                path="/profile"
                element={
                  <UserAuthorizedAccess>
                    <ProfilePage />
                  </UserAuthorizedAccess>
                }
              />
              <Route path="/search" element={<SearchPage />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminAuthorizedAccess>
                    <DashboardPage />
                  </AdminAuthorizedAccess>
                }
              />
              <Route
                path="/admin/listProducts"
                element={
                  <AdminAuthorizedAccess>
                    <ListProductsPage />
                  </AdminAuthorizedAccess>
                }
              />
              <Route
                path="/admin/listOrders"
                element={
                  <AdminAuthorizedAccess>
                    <ListOrdersPage />
                  </AdminAuthorizedAccess>
                }
              />
              <Route
                path="/admin/listUsers"
                element={
                  <AdminAuthorizedAccess>
                    <ListUsersPage />
                  </AdminAuthorizedAccess>
                }
              />
              <Route
                path="/admin/product/:id"
                element={
                  <AdminAuthorizedAccess>
                    <EditProductPage />
                  </AdminAuthorizedAccess>
                }
              />
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
