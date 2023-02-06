import './App.css';
import HomePage from './Pages/HomePage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProductPage from './Pages/ProductPage';
import Container from 'react-bootstrap/Container';
import Navigation from './Components/Navigation';
import ShoppingCartPage from './Pages/ShoppingCartPage';
import LogInPage from './Pages/LogInPage';
import AllProductsPage from './Pages/AllProductsPage';
import ShippingInfoPage from './Pages/ShippingInfoPage';
import RegistrationPage from './Pages/RegistrationPage';
import PaymentPage from './Pages/PaymentPage';
import PreviewOrderPage from './Pages/PreviewOrderPage';
import OrderHistoryPage from './Pages/OrderHistoryPage';
import ProfilePage from './Pages/ProfilePage';
import SearchPage from './Pages/SearchPage';
import DashboardPage from './Pages/DashboardPage';
import ListProductsPage from './Pages/ListProductsPage';
import ListOrdersPage from './Pages/ListOrdersPage';
import ListUsersPage from './Pages/ListUsersPage';

function App() {
  return (
    <BrowserRouter>
      <div className="site-container">
        <header>
          <Navigation />
        </header>

        <main className="main-section">
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<AllProductsPage />} />
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
            </Routes>
          </Container>
        </main>

        <footer className="text-center">
          Copyright &copy; 2023 Best True Value Hardware || Designed by Joshi &
          Acharya
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
