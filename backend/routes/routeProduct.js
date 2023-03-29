import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';

const routeProduct = express.Router();

// Route handler to fetch all products from the database
routeProduct.get('/', async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    // Send the list of products back to the client as a response
    res.status(200).send(products);
  } catch (error) {
    // If there was an error while retrieving products, send a server error response
    res.status(500).send({
      message: 'Error occurred while fetching products. Please try again later',
    });
  }
});

//Route handler to create a new Product
routeProduct.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Destructure request body
    const {
      name,
      slug,
      image,
      brand,
      department,
      description,
      price,
      countInStock = 0,
      rating = 0,
      numReviews = 0,
    } = req.body;

    // Create new product instance
    const newProduct = new Product({
      name: name || 'Product' + Date.now(),
      slug: slug || 'slug-' + Date.now(),
      image: image || '/images/p1.png',
      brand: brand || '-',
      department: department || '-',
      description: description || '...',
      price: price || 0,
      countInStock,
      rating,
      numReviews,
    });
    // Save the product to the database and send a response
    const product = await newProduct.save();
    res.send({ message: 'New Product Created', product });
  })
);

//Route handler to update an existing Product
routeProduct.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      // Get product id from request parameters
      const { id } = req.params;
      // Destructure request body
      const {
        name,
        slug,
        image,
        brand,
        department,
        description,
        price,
        countInStock,
      } = req.body;
      // Find and update product in the database
      const product = await Product.findByIdAndUpdate(
        id,
        {
          name,
          slug,
          image,
          brand,
          department,
          description,
          price,
          countInStock,
        },
        { new: true }
      );
      // Send updated product as response if found, else send error
      if (product) {
        res.send(product);
      } else {
        res.status(404).send({ message: 'Product not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server Error' });
    }
  })
);

//Helper function to delete a Product
async function deleteProduct(req, res) {
  try {
    // Get product id from request parameters
    const { id } = req.params;
    // Find product in the database and remove it
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    await product.remove();
    // Send success message as response
    res.send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server Error' });
  }
}

//Route handler to delete an existing Product
routeProduct.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(deleteProduct)
);

const PAGE_SIZE = 10;
//Route handler to get all products for admin view
routeProduct.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      // Destructure query parameters from request object
      const { query } = req;
      // Parse the page number from query string, default to page 1
      const page = parseInt(query.page) || 1;
      // Parse the page size from query string, default to PAGE_SIZE constant
      const pageSize = parseInt(query.limit) || PAGE_SIZE;
      // Parse the search query and filter query from query string, default to empty string
      const search = query.search || '';
      const filter = query.filter || '';

      // Create a case-insensitive regular expression to match search query
      const searchRegex = new RegExp(search, 'i');
      let filterObject = {};
      if (filter) {
        // Set filter object to include only products from the specified department
        filterObject = { department: filter };
      }

      // Find all products that match the search and filter criteria
      const products = await Product.find({
        ...filterObject,
        name: searchRegex,
      })
        .sort({ _id: -1 }) // sort products by descending ID
        .skip(pageSize * (page - 1)) // skip products that appear on previous pages
        .limit(pageSize); // limit the number of products returned to the page size

      // Count the number of products that match the search and filter criteria
      const countProducts = await Product.countDocuments({
        ...filterObject,
        name: searchRegex,
      });

      // Send the products to the client
      res.send({
        products,
        page,

        // Calculate the total number of pages based on the count of products and the page size
        pages: Math.ceil(countProducts / pageSize),
        count: countProducts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal server error' });
    }
  })
);

// Route handler to fetch a specific product by its slug
routeProduct.get('/slug/:slug', async (req, res) => {
  try {
    // Retrieve the product with the matching slug from the database
    const product = await Product.findOne({ slug: req.params.slug });

    // If the product exists, send it as a response
    if (product) {
      res.status(200).send(product);
    } else {
      // If the product does not exist, send a not found response
      res.status(404).send({
        message: 'Sorry, the product you are looking for cannot be found.',
      });
    }
  } catch (error) {
    // If there was an error while retrieving the product details, send a server error response
    res.status(500).send({
      message:
        'Error occurred while fetching product details. Please try again later',
    });
  }
});

// Route handler to get product by id
routeProduct.get('/:id', async (req, res) => {
  try {
    // Find product by id in the database
    const product = await Product.findById(req.params.id);
    if (product) {
      // If product exists, send the product as response
      res.send(product);
    } else {
      // If the product does not exist, send a not found response
      res.status(404).send({
        message: 'Sorry, the product you are looking for cannot be found.',
      });
    }
  } catch (error) {
    // If there was an error while retrieving the product details, send a server error response
    res.status(500).send({
      message:
        'Error occurred while fetching product details. Please try again later',
    });
  }
});

export default routeProduct;
