// Controller for Users
// where all of the main logic happens, where we are rendering views and working on models

const User = require("../models/user"); // user object returned by module.exports in user.js .. to go up one level and then into models

// Render register form ------------------------------------------------

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register"); // compiles register template view and creates html output
}

// ---------------------------------------------------------------------

// Register a new user ---------------------------------------------------

module.exports.register = async (req, res, next) => {
    // try to create a new user
    try {
        const { username, password, email } = req.body; // destructure to obtain username, password, email from the request body

        const user = User({ username, email }) // create new user object with email and username

        // provided by passport-local-mongoose, method to register a new user instance with a given password, also checks if username is unique
        // .register takes the entire user model and the password, and hash the password and store it
        // hashes the password and takes a salt and stores the salt and hash on our user
        // we do not have to write authentication from scratch because passport does it all for us
        const registeredUser = await User.register(user, password);

        // if created user successfully,
        // When a user registers and we succesfully make that user
        // Want to log the user in
        // use helper method called .login() from passport that establishes a login session
        // this function requires a callback, that has an error parameter
        req.login(registeredUser, err => {
            // if there is an error
            if (err) {
                // return next with the error and hit our error handler
                return next(err);
            }
            // otherise if no error
            req.flash("success", "Welcome to Yelp Camp!"); // flash welcome message

            res.redirect("/campgrounds"); // redirect to all campgrounds
        });
        // if there is an error, flash error message
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register"); // redirect back to register
    }
}

// ---------------------------------------------------------------------

// Render login form ---------------------------------------------------

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login"); // compiles login template view and creates html output
}

// ---------------------------------------------------------------------

// Log user in ---------------------------------------------------------

module.exports.login = (req, res) => {

    // if we make it into this login route, into this handler, then we know that a user was authenticated successfully
    req.flash("success", "Welcome back!"); // flash welcome back message

    // redirectUrl either the URL the user was at before having to login or just the all campgrounds page if they went directly to login
    // obtained req.session.returnTo from our isLoggedIn middleware
    const redirectUrl = req.session.returnTo || "/campgrounds";

    // delete the returnTo URL so it is not sitting in the session
    delete req.session.returnTo;

    res.redirect(redirectUrl); // redirect to all campgrounds
}

// ---------------------------------------------------------------------

// Log User out --------------------------------------------------------

module.exports.logout = (req, res) => {
    // passport comes with a method on the request body called .logout() which terminates the login session
    req.logout();

    req.flash("success", "Sucessfully logged out!"); // flash success message

    res.redirect("/campgrounds"); // redirect to all campgrounds
}