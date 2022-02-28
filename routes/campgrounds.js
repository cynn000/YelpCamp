// Routes for campground
// set up routes, middleware can call in controller methods
// moved all routes for campground from app.js to here to make app.js lighter
// changed app.get/post/etc to router.get/post/etc
// since we are using /campgrounds as our prefix in our app.js, also need to take out prefix campgrounds here

const express = require("express"); // load the express module

// don't need mergeParams here like in reviews.js since all the params are defined in this route/path
const router = express.Router();    // creates new router object so we can add middleware and http method routes just like app.get except using router.get

const catchAsync = require("../utils/catchAsync") // load the catchAsync function in the utils folder .. to go up one level and then into utils
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware"); // load the isLoggedIn, isAuthor, validateCampground middleware from middleware file

const campgrounds = require("../controllers/campgrounds"); // load the campgrounds module from in controllers .. to go up one level and then into controllers

const { storage } = require("../cloudinary") // load the storage object from index.js don't need to specify index.js since node automatically looks for a index.js file

const multer = require("multer"); // load the multer module
const upload = multer( { storage }); // initialize or execute it and pass in a configuration object which is the destination for the files which is our storage object

// router.route allows us to define a single route which then handles different verbs
// route path matching requests to root route /campgrounds
router.route("/")
    .get(catchAsync(campgrounds.index)) 
    // set up the end point as POST to where the form is submitted to
    // added middleware isLoggedIn to ensure user is authenticated before creating a new campground
    // added middleware upload.array("image") to expect multiple files under the key of image
    // added middleware validateCampground to validate request of campground
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground)); 

// ---------------------------------------------------------------------

// Creation of new campground ------------------------------------------

// added middleware isLoggedIn to ensure user is authenticated before viewing page
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// ---------------------------------------------------------------------

// router.route allows us to define a single route which then handles different verbs
// route handing /:id
router.route("/:id")
    // Reading data and show
    // show route for a single campground
    .get(catchAsync(campgrounds.showCampground))
    // updating campground
    // route to submit the form, we are faking put with method override seen in edit.ejs
    // added middleware isLoggedIn to ensure user is authenticated before editing
    // added middleware isAuthor to check if the current user owns the campground to edit
    // added middleware upload.array("image") to expect multiple files under the key of image
    // added middleware validateCampground to validate request of campground
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    // delete campground
    // route to delete with the id
    // method override tricks express into thinking its a delete request with method override
    // added middleware isLoggedIn to ensure user is authenticated before deleting
    // added middleware isAuthor to check if the current user owns the campground to delete
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// ---------------------------------------------------------------------

// ---------------------------------------------------------------------

// Upating campground --------------------------------------------------
// need two routes for editing,
// one for the form
// one for submitting the form

// route that serves the form
// added middleware isLoggedIn to ensure user is authenticated before viewing edit page
// added middleware isAuthor to check if the current user owns the campground to view edit page
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// ---------------------------------------------------------------------

// module.exports router to be used in other files
module.exports = router;