import './App.css';
import HomePage from './Pages/HomePage';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import ProductPage from './Pages/ProductPage';

function App() {
  return (
    <BrowserRouter>
      <div>
        <header>
          <Link to="/">Best True Value Hardware</Link>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
