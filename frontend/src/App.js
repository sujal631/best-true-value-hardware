import './App.css';
import HomePage from './Pages/HomePage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProductPage from './Pages/ProductPage';
//import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
//import { LinkContainer } from 'react-router-bootstrap';
import Navigation from './Components/Navigation';
import ShoppingCartPage from './Pages/ShoppingCartPage';
import LogInPage from './Pages/LogInPage';
import AllProductsPage from './Pages/AllProductsPage';

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
