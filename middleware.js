// File for all our middleware functions

const ExpressError = require("./utils/ExpressError") // load the ExpressError class from utils folder
const { campgroundSchema, reviewSchema } = require("./schemas.js"); // load the JOI campgroundSchema and reviewSchema from schemas, destructure to obtain campgroundSchema and reviewSchema
const Campground = require("./models/campground"); // campground object returned by module.exports in campground.js
const Review = require("./models/review"); // review object returned by module.exports in review.js

// we want to ensure a user is logged in before they can access that route. 
// we can set up middleware to be used in any of our routes.
// export it to be used in other files
module.exports.isLoggedIn = (req, res, next) => {
    // if a user hits a page that requires login, current functionality will send user to login page,
    // once user logs in, will have to navigate back to the page that they were originally at
    // to fix this, we use req.session.returnTo = req.originalUrl; and also redirect in our user route
    // returnTo is the URL that we want to redirect the user back to URL is req.originaUrl
    req.session.returnTo = req.originalUrl;

    // isAutenticated is automatically added to the request object, determines if the request is authenticated
    // if you are NOT authenticated
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be signed in!"); // flash error message
        return res.redirect("/login"); // redirect to login page
    }
    next(); // otherwise call next to next route
}

// checks to see if the current user logged in is the owner of the campground in order to edit
// export it to be used in other files
module.exports.isAuthor = async(req, res, next) => {

    const { id } = req.params; // destructures, gives the id of a campground

    // before updating, check to see if campground has same author id as currently logged in user
    // find first, and then check to see if we can update .findById() returns a promise we await on
    const campground = await Campground.findById(id);

    // if the current logged in user does not own the campground
    if (!campground.author.equals(req.user._id)) {
        // flash message for no permission
        req.flash("error", "You do not have permission to do that!");

        // redirect to specific campground show page
        return res.redirect(`/campgrounds/${id}`);
    }

    // otherwise move on next, a user does have permission to edit this campground
    next();
}

// checks to see if the current user logged in is the owner of the review in order to edit
// export it to be used in other files
module.exports.isReviewAuthor = async(req, res, next) => {

    const { id, reviewId } = req.params; // destructures, gives the id of campground and id of review

    // before updating, check to see if review has same review author id as currently logged in user
    // find first, and then check to see if we can update .findById() returns a promise we await on
    const review = await Review.findById(reviewId);

    // if the current logged in user does not own the review
    if (!review.author.equals(req.user._id)) {
        // flash message for no permission
        req.flash("error", "You do not have permission to do that!");

        // redirect to specific campground show page
        return res.redirect(`/campgrounds/${id}`);
    }

    // otherwise move on next, a user does have permission to edit this campground
    next();
}

// want this to be selectively applied
// will need to add this function as an argument
// where we need to validate the request of campground
// export it to be used in other files
module.exports.validateCampground = (req, res, next) => {
    // now need to pass our data through to the schema
    // just need the error portion
    const { error } = campgroundSchema.validate(req.body);

    // if there is an error
    if (error) {
        // error.details is an array of objects, we need to map over it and turn it into a single string and join it together
        // map over them, return a single new string that we join 
        const msg = error.details.map(el => el.message).join(",");
        
        // when we throw an express error inside our async function,
        // our catchAsync is going to catch that error and hand it off
        // to next() which then makes it down to the generic error handler at the bottom
        // this is the infrastructure set up where we can throw any of these errors
        // and specify a message and statusCode in which the generic error handler will use
        throw new ExpressError(msg, 400);
    }
    // need to call next to go to next route handler if no error
    else {
        next();
    }
}

// want this to be selectively applied
// will need to add this function as an argument
// where we need to validate the request of review
// same as validateCampground
// need to validate the request of a review
module.exports.validateReview = (req, res, next) => {
    // now need to pass our data through to the schema
    // just need the error portion
    const { error } = reviewSchema.validate(req.body);

    // if there is an error
    if (error) {

        // error.details is an array of objects, we need to map over it and turn it into a single string and join it together
        // map over them, return a single new string that we join 
        const msg = error.details.map(el => el.message).join(",");
        
        // when we throw an express error inside our async function,
        // our catchAsync is going to catch that error and hand it off
        // to next() which then makes it down to the generic error handler at the bottom
        // this is the infrastructure set up where we can throw any of these errors
        // and specify a message and statusCode in which the generic error handler will use
        throw new ExpressError(msg, 400);
    }
    // need to call next to go to next route handler if no error
    else {
        next();
    }
}