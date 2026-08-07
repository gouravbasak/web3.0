const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// POST /api/reviews/:productId - Add review for a product
router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    console.log('=== REVIEW SUBMISSION START ===');
    console.log('Product ID:', req.params.productId);
    console.log('User ID from token:', req.userId);
    console.log('Request body:', req.body);
    
    const { productId } = req.params;
    const { rating, comment, orderId } = req.body;
    const userId = req.userId;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      console.log('Validation failed: Invalid rating');
      return res.status(400).json({ 
        message: 'Rating is required and must be between 1 and 5' 
      });
    }

    if (!orderId) {
      console.log('Validation failed: Missing orderId');
      return res.status(400).json({ 
        message: 'Order ID is required' 
      });
    }

    console.log('Looking for product:', productId);
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product found:', product.title);
    console.log('Looking for user:', userId);
    
    // Get user info
    const user = await User.findById(userId).select('name');
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.name);
    
    // Check if user already reviewed this product from this order
    const existingReview = product.reviews.find(
      review => review.userId.toString() === userId && review.orderId === orderId
    );

    if (existingReview) {
      console.log('User already reviewed this product from this order');
      return res.status(400).json({ 
        message: 'You have already reviewed this product from this order' 
      });
    }

    console.log('Adding review...');
    
    // Add review
    product.reviews.push({
      userId,
      userName: user.name,
      rating: parseInt(rating),
      comment: comment || '',
      orderId
    });

    // ⭐⭐⭐ STEP 3 CODE GOES HERE ⭐⭐⭐
    // Calculate average rating and review count
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = parseFloat((totalRating / product.reviews.length).toFixed(1));
    product.reviewCount = product.reviews.length;
    // ⭐⭐⭐ END STEP 3 CODE ⭐⭐⭐

    console.log('New average rating:', product.averageRating);
    console.log('New review count:', product.reviewCount);
    console.log('Saving product with new review...');
    
    await product.save();

    console.log('=== REVIEW SUBMISSION SUCCESS ===');
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        rating: parseInt(rating),
        comment: comment || '',
        userName: user.name,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Review submission error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId)
      .select('reviews averageRating reviewCount title');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      reviews: product.reviews,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      productTitle: product.title
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/user - Get user's reviews
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find all products that have reviews from this user
    const products = await Product.find({
      'reviews.userId': userId
    }).select('title images reviews averageRating');
    
    // Extract user's reviews from each product
    const userReviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        if (review.userId.toString() === userId) {
          userReviews.push({
            productId: product._id,
            productTitle: product.title,
            productImage: product.images[0] || null,
            rating: review.rating,
            comment: review.comment,
            orderId: review.orderId,
            createdAt: review.createdAt
          });
        }
      });
    });
    
    // Sort by most recent
    userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ reviews: userReviews });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;