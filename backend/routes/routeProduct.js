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

// Route handler to add a review to a specific product
routeProduct.post(
  '/:id/reviews',
  isAuth, // Middleware to check if the user is authenticated
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    // Check if the product exists
    if (product) {
      // Check if the user has already submitted a review for the product
      if (
        product.reviews.find(
          (x) => x.name === `${req.user.firstName} ${req.user.lastName}`
        )
      ) {
        return res
          .status(400)
          .send({ message: 'You can only submit one review per product.' });
      }

      // Create a new review object from the request data
      const review = {
        user: req.user._id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        rating: Number(req.body.rating),
        title: req.body.title,
        comment: req.body.comment,
      };

      // Add the review to the product and update the overall rating
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;

      // Save the updated product
      const updatedProduct = await product.save();

      // Send the newly created review as a response
      res.status(201).send({
        message: 'Review Created',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      // If the product is not found, send an error message
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

// Route handler to retrieve the likes and dislikes of all reviews
routeProduct.get(
  '/likes-dislikes',
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find({});

    // Calculate the total likes and dislikes for all reviews
    const likesDislikes = products.reduce(
      (acc, product) => {
        product.reviews.forEach((review) => {
          acc.likes[review._id] = review.likes.length;
          acc.dislikes[review._id] = review.dislikes.length;
        });
        return acc;
      },
      {
        likes: {},
        dislikes: {},
      }
    );
    // Send the likes and dislikes as a response
    res.status(200).send(likesDislikes);
  })
);

// Route handler to like a specific review
routeProduct.put(
  '/:id/reviews/:reviewId/like',
  isAuth, // Middleware to check if the user is authenticated
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const review = product.reviews.find(
      (r) => r._id.toString() === req.params.reviewId
    );

    // Check if the review exists
    if (!review) {
      res.status(404).send({ message: 'Review not found' });
    } else {
      // Update the review's likes and remove from dislikes if necessary
      if (!review.likes.includes(req.user._id)) {
        review.likes.push(req.user._id);
        if (review.dislikes.includes(req.user._id)) {
          review.dislikes.pull(req.user._id);
        }
      } else {
        review.likes.pull(req.user._id);
      }

      // Save the updated product
      const updatedProduct = await product.save();

      // Send the updated likes and dislikes as a response
      res.status(200).send({
        message: 'Review like updated',
        updatedLikes: review.likes,
        updatedDislikes: review.dislikes,
      });
    }
  })
);

// Route handler to dislike a specific review
routeProduct.put(
  '/:id/reviews/:reviewId/dislike',
  isAuth, // Middleware to check if the user is authenticated
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const review = product.reviews.find(
      (r) => r._id.toString() === req.params.reviewId
    );

    // Check if the review exists
    if (!review) {
      res.status(404).send({ message: 'Review not found' });
    } else {
      // Update the review's dislikes and remove from likes if necessary
      if (!review.dislikes.includes(req.user._id)) {
        review.dislikes.push(req.user._id);
        if (review.likes.includes(req.user._id)) {
          review.likes.pull(req.user._id);
        }
      } else {
        review.dislikes.pull(req.user._id);
      }

      // Save the updated product
      const updatedProduct = await product.save();

      // Send the updated likes and dislikes as a response
      res.status(200).send({
        message: 'Review dislike updated',
        updatedLikes: review.likes,
        updatedDislikes: review.dislikes,
      });
    }
  })
);

// Route handler to remove a specific review
routeProduct.delete(
  '/:id/reviews/:reviewId',
  isAuth, // Middleware to check if the user is authenticated
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === req.params.reviewId
    );

    // Check if the review exists
    if (reviewIndex === -1) {
      res.status(404).send({ message: 'Review not found' });
    } else {
      const review = product.reviews[reviewIndex];

      // Check if the user is the author of the review
      if (review.user.toString() === req.user._id.toString()) {
        // Remove the review from the product
        product.reviews.splice(reviewIndex, 1);

        // Save the updated product
        const updatedProduct = await product.save();

        // Send the updated reviews as a response
        res.status(200).send({
          message: 'Review deleted',
          updatedReviews: updatedProduct.reviews,
        });
      } else {
        // If the user is not authorized to delete the review, send an error message
        res
          .status(403)
          .send({ message: 'Not authorized to delete this review' });
      }
    }
  })
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

const SEARCH_PAGE_SIZE = 9;
routeProduct.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || SEARCH_PAGE_SIZE;
    const page = query.page || 1;
    const department = query.department || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const departmentFilter =
      department && department !== 'all' ? { department } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { numReviews: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...departmentFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...departmentFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

routeProduct.get(
  '/departments',
  expressAsyncHandler(async (req, res) => {
    const departments = await Product.find().distinct('department');
    res.send(departments);
  })
);
routeProduct.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});
routeProduct.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

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
