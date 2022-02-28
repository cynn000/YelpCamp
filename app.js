// YelpCamp
// Project part of Cole Steel's web development course: The Web Developer Bootcamp 2022 on Udemy
// 02-10-2022

// images from https://source.unsplash.com/collection/483251

/*
 .env
 don't want to be directly embedding any API credentials or secret keys right inside of our application
 what we do instead is we store them in a secret file
 we store them in a file that we don't include when we submit our code to Github for example
 it's a file that stays on our machine locally and it's called .env
 in here we define key value pairs
 in order to get access to this information inside of our app we will use a package called dotenv that we install with npm
*/
// process.env.NODE_ENV is an environment variable that is usually just development or production
// if we are not in production mode
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config(); // load the .env package. Going to take the variables we defined in our .env file and add them into process.env in this app, we can access them in this file or any other files
}

const express = require("express"); // load the express module
const path = require("path"); // load the path module
const mongoose = require("mongoose"); // load the mongoose module
const ejsMate = require("ejs-mate"); // load the ejs-mate module
const session = require("express-session") // load the express session module
const flash = require("connect-flash"); // load the flash module
const ExpressError = require("./utils/ExpressError") // load the ExpressError class from utils
const methodOverride = require("method-override");  // load the methodOverride module, this is to fake a put, patch, delete, request
const passport = require("passport") // load the passport module, allows us to plug in multiple strategies for authentication
const LocalStrategy = require("passport-local"); // load the local passport module, this strategy authenticates users using a username and password
const mongoSanitize = require("express-mongo-sanitize"); // load the express mongo sanitize module to protect again query searches in the url
const helmet = require("helmet"); // load the helmet module comes with set of 11 middleware that have to deal with HTTP headers
const MongoStore = require("connect-mongo"); // load the connect mongo module

const User = require("./models/user"); // load the User model from the models folder

const userRoutes = require("./routes/users"); // load the user router in the routers folder
const campgroundRoutes = require("./routes/campgrounds"); // load the campground router in the routes folder
const reviewRoutes = require("./routes/reviews"); // load the reviews router in the routes folder

// dbURL is the url to connect to the cluster in mongo atlas
// use process.env.DB_URL for deployment, production 
// use "mongodb://localhost:27017/yelp-camp" for development
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

// connect to MongoDB. Set up connection to the database locally which is through mongodb://localhost:27017/yelp-camp
// can use local database for development
// need to serve our mongo database over the internet and then connect to a server
mongoose.connect(dbUrl);

// reference to mongoose.connection called db shortcut to reference
// accesses the default connection
const db = mongoose.connection;

// logic to check for error
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => { // once successfully connected
    console.log("Database connected");  // print success message
});

const app = express();  // start new express application

// tell Express to use the ejs-mate engine instead of the default choice
// ejs-mate is used to parse and make sense of ejs
app.engine("ejs", ejsMate);

// Middleware ----------------------------------------------------------

// set view engine and views folder in express
app.set("view engine", "ejs"); // tels express to use ejs templating engine
app.set("views", path.join(__dirname, "views")); // tells express to use the /views folder in app directory

// by default, request.body is going to be empty. if we send a response with the request.body,
// the request has not been parse so we have to tell express to parse the body by:
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method")); // _method is the string we want to use for our query string
app.use(express.static(path.join(__dirname, "public"))); // to serve static files in the /public folder in app directory

// production purposes use process.env.SECRET is an environment variable that we can configure on Heroku
// development purposes use "thisshouldbeabettersecret!"
const secret = process.env.SECRET || "thisshouldbeabettersecret!"

// create the store
// default storage mechanism or location for express session uses a memory store. It manages things in memory
// want our session information to be stored in Mongo, need to use the mongo store we created
const store = MongoStore.create({
    mongoUrl: dbUrl, // in production will be the mongo url
    touchAfter: 24 * 60 * 60, // lazy update the session by limiting a period of time update once very 24 hours 24 * 60 * 60 24 hours in seconds
    crypto: {
        secret
    }
});

// check for errors
store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
});

// session options
const sessionConfig = {
    store, // use mongo to store our information
    name: "session", // instead of the default connect.sid we set a name
    secret,   // used to sign the session ID cookie
    resave: false,  // forces session to be saved back to session store
    saveUninitialized: true, // forces session to be saved to store
    cookie: {
        httpOnly: true, // cookie cannot be accessed through client side scripts, extra security
        //secure: true, // cookies can only be configured over HTTPS, HTTP SECURE
        // Date.now() is the current datein MILISECONDs add 1000 * 60 * 60 * 24 * 7 to expire in 1 week from current date
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 // maxAge is 1 week
    }
    // store default is memory store
}

// use session middleware with session options sessionConfig object
// session is stored on server-side
// used to assign a unique session to every user of the app, allows to store user state
app.use(session(sessionConfig));

// use flash middleware used for flashing messages
app.use(flash());

app.use(passport.initialize()); // initializes passport, initializes the authentication module
app.use(passport.session());    // use passport.session middleware for persistent login sessions

// use the local strategey, authentication method is located on our User model called authenticate (coming from passport-local-mongoose)
// passport-local-mongoose automatically creates static methods for the model
passport.use(new LocalStrategy(User.authenticate()));

// Serialize and Deserialize deal with how information is stored and retrieve from the session
// tells passport to serialize a user, tells passport how to store a user in the session
// this method is added in by passport-local mongoose
passport.serializeUser(User.serializeUser());

// tells passport to get a user out of the session
// this method is added in by passport-local mongoose
passport.deserializeUser(User.deserializeUser());

// on every single request
// take whatever is in the flash under success and have access to it in our locals, with the key success or error
// don't need to pass anything to our templates with this, we will always have access to something called success or error now
// this middleware is to add onto the response object in a such a way that in every single tempate and every view will have access to messages
// have access to these locals in every single template
app.use((req, res, next) => {
    // req.user stores information about the user. Comes from the session from Passport
    // can now use currentUser in Navbar template to show/hide links depending if someone is logged in or not
    res.locals.currentUser = req.user; // have access to object user in templates

    res.locals.success = req.flash("success"); // have access to flash success trigger in templates
    res.locals.error = req.flash("error"); // hasve acess to flash error trigger in templates
    next(); // call next to go to next route handler
});

// address basic level of attack in url is not allow users to have dollar signs or periods.
// removes any keys containing prohibited characters
// protect against query in searches
app.use(mongoSanitize());

// all sites to allow
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dhmxqcqer/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dhmxqcqer/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dhmxqcqer/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dhmxqcqer/" ];

// enables all 11 of the middleware that is provided with helmet
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhmxqcqer/",
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dhmxqcqer/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

// Using Router Routes--------------------------------------------------

// specify the router we want to use which is userRoutes and a path that we want to prefix with which is /
app.use("/", userRoutes);

// specify the router we want to use which is campgroundRoutes and a path that we want to prefix with which is /campgrounds
app.use("/campgrounds", campgroundRoutes);

// router: reviewRoutes, prefix: /campgrounds/:id/reviews
// /campgrounds/:id/reviews there is an ID in the path that prefixes all of these routes
// but by default we do not have access to that ID in our reviews.js routes need to use mergeParams: true
app.use("/campgrounds/:id/reviews", reviewRoutes);

// ---------------------------------------------------------------------

// ---------------------------------------------------------------------

// route path matching requests to root route /
app.get("/", (req, res) => {
    res.render("home"); // compiles home template view and creates html output
});

// ---------------------------------------------------------------------

// Error handling ------------------------------------------------------

// for every single request
// will only run if nothing else has matched first and we didn't respond for any of them
app.all("*", (req, res, next) => {
    // when we call next(), it is calling the generic error handler below
    // the err is the ExpressError pass through
    next(new ExpressError("Page Not Found", 404));
});

// generic error handler, can use status code and message
app.use((err, req, res, next) => {
    // destructuring from err
    // default values is 500
    const { statusCode = 500 } = err;

    // if not error message, set default message
    if (!err.message) err.message = "Oh No, Something Went Wrong."

    res.status(statusCode).render("error", { err }); // pass err through to the template
});

// ---------------------------------------------------------------------

// ---------------------------------------------------------------------

app.listen(3000, () => {    // listen for connections on port 3000
    console.log("Serving on port 3000");
});



