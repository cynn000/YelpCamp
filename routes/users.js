// Routes for user

const express = require("express"); // load the express module
const router = express.Router(); // creates new router object so we can add middleware and http method routes just like app.get except using router.get
const passport = require("passport"); // load the passport module
const catchAsync = require("../utils/catchAsync"); // load the catchAsync function in the utils folder .. to go up one level and then into utils

const users = require("../controllers/users"); // load users module from controllers folder

// Register a new user ---------------------------------------------------

// router.route allows us to define a single route which then handles different verbs
// route handing /register
router.route("/register")
    // render register page
    .get(users.renderRegisterForm)
    // route that we sbumit to when we register NOT logging in
    // catchAsync to catch any errors
    .post(catchAsync(users.register));

// ---------------------------------------------------------------------

// Route handling login ------------------------------------------------
 
// router.route allows us to define a single route which then handles different verbs
// route handing /login
router.route("/login")
    // login route, just serves a form
    .get(users.renderLoginForm)
    // actual login route, ensuring credentials are valid
    // passport gives use the passport.authenticate middleware
    // specify strategy which is "local", and options failureFlash: true (going to flash a failure message automatically if failure),
    // and failureRedirect: "/login" (going to redirect to /login if there was a failure)
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login);

// route for logging out
router.get("/logout", users.logout);

// module.exports router to be used in other files
module.exports = router;