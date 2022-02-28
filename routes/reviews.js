// Reviews Route file
// moved all routes for reviews from app.js to here to make app.js lighter
// changed app.get/post/etc to router.get/post/etc
// since we are using /campgrounds/:id/reviews as our prefix in our app.js, also need to take out prefix /campgrounds/:id/reviews here

const express = require("express"); // load the express module

// express router likes to keep params separate
// need to use mergeParams: true to merge params from other files to this file
const router = express.Router( { mergeParams: true }); // creates new router object

const catchAsync = require("../utils/catchAsync") // load the catchAsync function in the utils folder .. to go up one level and then into utils
const {isLoggedIn, isReviewAuthor, validateReview } = require("../middleware"); // load the isLoggedIn, isReviewAuthor, validateCampground middleware from middleware file .. to go up one level and then into middleware file

const reviews = require("../controllers/reviews"); // load the reviews module in the controllers folder

// ---------------------------------------------------------------------

// Review Routes -------------------------------------------------------

// Creating a new review -----------------------------------------------

// validateReview, added middleware for validation
// added middleware isLoggedIn, if someone were to manually send a request or use POSTMAN to send a post request to /reviews
// isLoggedIn checks to see if they are logged in first
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// ---------------------------------------------------------------------

// Deleting a review ---------------------------------------------------

// remove the reference to whatever the review is in the campground and we want to remove the review itself
// added middleware isLoggedIn, if someone were to manually send a request or use POSTMAN to send a delete request to /reviews:id
// isLoggedIn checks to see if they are logged in first
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

// ---------------------------------------------------------------------

// module.exports router to be used in other files
module.exports = router;