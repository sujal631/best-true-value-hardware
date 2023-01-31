import { Link } from 'react-router-dom';
import data from '../data'; // importing data from '../data'

const HomePage = () => (
  // functional component to render the home page

  <div>
    <h1>Sample Products</h1>
    <div className="product-container">
      {data.product.map(({ productNumber, slug, image, name, price }) => (
        // mapping through the products in data and destructuring the required values

        <div className="product" key={productNumber && slug}>
          {/* using productNumber and slug as key, both of them will be used */}

          <Link to={`/product/${slug}`}>
            {/* creating link using product's slug */}
            <img src={image} alt={name} /> {/* using product's image */}
          </Link>

          <div className="product-info">
            <Link to={`/product/${slug}`}>
              {/* creating link using product's slug */}
              <p>{name}</p> {/* displaying product's name */}
            </Link>
            <p>
              <strong>${price}</strong> {/* displaying product's price */}
            </p>
            <button>Add to Cart</button> {/* Add to cart button */}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// exporting HomePage component as default export
export default HomePage;
