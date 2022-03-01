// This file is self-contained
// Meaning that it connects to Mongoose and it's going to use the model
// Need to run this file on it's own, separately from our node app, any time
// we can to see our database. Not going to be often, only when we make changes to the model
// or to the data.
// originally used to populate our database with many campgrounds

const mongoose = require("mongoose"); // load the mongoose module
const cities = require("./cities"); // import the array of cities
const { places, descriptors } = require("./seedHelpers"); // destructuring here, and import descriptors and places array from seedHelpers
// need to back out one folder with ../ since models folder is not in the seeds folder
const Campground = require("../models/campground"); // campground object returned by module.exports in campground.js
const Review = require("../models/review");

// connect to MongoDB. Set up connection to the database which is stored locally on our machine
// need to serve our mongo database over the internet and then connect to a server
mongoose.connect("mongodb://localhost:27017/yelp-camp");

// reference to mongoose.connection called db shortcut to reference
// accesses the default connection
const db = mongoose.connection;

// logic to check for error
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => { // once successfully connected
    console.log("Database connected");  // print success message
});

// sample is an element that was chosen randomly 
const sample = array => array[Math.floor(Math.random() * array.length)]; //pick a random element from an array

// removes everything from in the database
// async function must await on promise obtained from .deleteMany
const seedDB = async () => {
    await Campground.deleteMany({}); // deletes all campgrounds
    await Review.deleteMany({}); // delete all reviews
    
    // create 200 new campgrounds
    for (let i = 0; i < 200; i++) {
        // random number between 0 and 1000
        const random1000 = Math.floor(Math.random() * 1000) // Math.floor because Math.random gives a float, needs to be a integer

        // random number for price between 10 and 30
        const price = Math.floor(Math.random() * 20) + 10; // Math.floor to get a whole number

        // build a campground with a title based on random descriptor and place in seedHelpers
        // and a location of city and province from given city in cities array
        const camp = new Campground({
            // setting author for all campgrounds to be campingfan100
            author: "621d2e3402ff2bae2a99a1dc",

            // passing in array descriptors and array places in which the function sample will be a random element from each array
            title: `${sample(descriptors)} ${sample(places)}`,

            // geometry point for displaying on map
            // for GeoJSON want longitude first and then latitude
            // optaining long and lat from random city and access long and lat from cities file
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude, 
                    cities[random1000].latitude
                ]
            },

            // loads images for a campground
            // old image url: "https://source.unsplash.com/collection/483251"
            images: [
                {
                  url: "https://res.cloudinary.com/dhmxqcqer/image/upload/w_1000,ar_1:1,c_fill,g_auto/v1646068759/YelpCamp/campground_d8eboq.jpg",
                  filename: "YelpCamp/campground_d8eboq"
                },
                {
                  url: "https://res.cloudinary.com/dhmxqcqer/image/upload/w_1000,ar_1:1,c_fill,g_auto/v1646068849/YelpCamp/lake_y3nrdp.jpg",
                  filename: "YelpCamp/lake_y3nrdp"
                }
            ],
            
            // shorthand of putting in price, same as price : price,
            price, 

            // lorem ipsum as placeholder for now
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim aspernatur assumenda eaque nemo repellendus nam id consectetur repellat nulla exercitationem voluptatibus ut perspiciatis, officiis vel magni nesciunt voluptatem laborum ad.",

            // cities[random1000] choose a random city in cities and access city and province fields
            location: `${cities[random1000].city}, ${cities[random1000].province}`
        });
        await camp.save();
    }
}

// execute seedDB() function, since it is a async function, it returns a promise
seedDB().then(() => {
    mongoose.connection.close(); // close connection, don't need to manually close database everytime we run it
});