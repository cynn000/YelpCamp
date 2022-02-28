// Controller for Reviews
// where all of the main logic happens, where we are rendering views and working on models

const Campground = require("../models/campground"); // campground object returned by module.exports in campground.js .. to go up one level and then into models
const Review = require("../models/review"); // load the review model in the models folder .. to go up one level and then into models

// Creating a new review -----------------------------------------------

module.exports.createReview = async (req, res) => {
    // find the campground associated with the id
    const campground = await Campground.findById(req.params.id);

    // create a new review
    // retrieve the body.review from review[body] in the form of campground show.ejs
    const review = new Review(req.body.review);

    // after we make a new review, set author to be current user id
    review.author = req.user._id;

    // push new review in reviews array of campground
    campground.reviews.push(review);

    await review.save();     // save the newly created review
    await campground.save(); // save the campground with review pushed on review array

    // flash message after successfully creating a new review
    req.flash("success", "Successfully created a new review!");

    // redirect to the specific campground
    res.redirect(`/campgrounds/${campground._id}`);
}

// ---------------------------------------------------------------------

// Deleting a review ---------------------------------------------------

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    
    // find that campground and remove the reference to the specific review
    // $pull removes from an existing array all instaces of a value that match a condition
    // $pull operator takes reviewId and pull anything with that ID out of reviews, again, reviews is an array of IDs
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    // flash message after successfully deleting a new review
    req.flash("success", "Succesfully deleted review!");

    // redirect back to campground page
    res.redirect(`/campgrounds/${id}`);
}
