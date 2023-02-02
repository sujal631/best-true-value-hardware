import './App.css';
import HomePage from './Pages/HomePage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProductPage from './Pages/ProductPage';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';

function App() {
  return (
    <BrowserRouter>
      <div className="site-container">
        <header>
          <Navbar bg="black" variant="dark" expand="lg">
            <Container>
              <LinkContainer to="/">
                <Navbar.Brand>
                  <img
                    src={require('./logo.png')}
                    alt="Logo"
                    style={{
                      width: '60px',
                      height: '50px',
                      marginRight: '10px',
                    }}
                  />
                  Best True Value Hardware
                </Navbar.Brand>
              </LinkContainer>
            </Container>
          </Navbar>
        </header>
        <main className="main-section">
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
            </Routes>
          </Container>
        </main>

        <footer className="text-center" style={{ height: '50px' }}>
          Copyright &copy; 2023 Best True Value Hardware || Designed by Joshi &
          Acharya
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
