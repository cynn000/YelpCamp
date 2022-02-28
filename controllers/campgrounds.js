// Controller for Campgrounds
// where all of the main logic happens, where we are rendering views and working on models

const Campground = require("../models/campground"); // campground object returned by module.exports in campground.js .. to go up one level and then into models
const { cloudinary } = require("../cloudinary"); // load the cloudinary module from the cloudinary folder, node automatically looks for the index.js file, don't need to specify

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); // load the mapbox geocoding module
const mapBoxToken = process.env.MAPBOX_TOKEN; // obtain the MAPBOX TOKEN from the .env file
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // pass token through when instantiate a new map box


// process of waiting for something to come back from Mongoose
// and then responding, we use asyn/await
// async function returns a promise
// must await on promise obtained from .save()
// export it to be used in other files
module.exports.index = async (req, res, next) => {
    // .find() returns a promise that we await on
    const campgrounds = await Campground.find({});     // finds all the campgrounds

    // pass campgrounds through to our template
    // campgrounds is a folder with index.ejs
    res.render("campgrounds/index", { campgrounds }); // compiles index template view and creates html output
}

// --------------------------------------------------------------------

// Creation of new campground ------------------------------------------

// renders a form to create a new campground
// order matters! If we had the get for /campgrounds/new after
// /campgrounds/:id we would be hitting the route with :id and it
// cannot find any campground with id of new. So /campgrounds/new needs to be first
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new"); // compiles new template view and creates html output
}

module.exports.createCampground = async (req, res, next) => {

    // Forward geocoding gets coordinates from a string (place name)
    // .forwardGeocode query type looks up a location by name
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, // a place name, here we are using the location of campground in request body
        limit: 1, // number of results returned
    }).send(); // send query after calling the function

    // need to take request.body.campground inside of our route and
    // create a new campground
    const campground = new Campground(req.body.campground); // creating a new campground model

    // add on geometry coming from the geocoding API
    // features is an array
    // .geometry gives back GeoJSON (from Mapbox) which follows format: type field of type Point (ALWAYS) and coordinates [longitute, latitude] an array
    // gives the coordinates in an array of [longitude, latitude]
    // store coordinate point in our campground model
    // mongo supports GeoJSON functionality
    campground.geometry = geoData.body.features[0].geometry;

    // have access to req.files to from the routes
    // need to loop over files and take the path and file name and add it to the campground
    // map over the req.files array to make a new object with the file's url and filename and put it in an array
    // end up with however many images with those two properties and add it onto campground
    // upload images to be square by replacing /upload with /upload/w_1000,ar_1:1,c_fill,g_auto which is a certain square size
    campground.images = req.files.map(f => ({ url: f.path.replace("/upload", "/upload/w_1000,ar_1:1,c_fill,g_auto"), filename: f.filename }))

    // take userID and save it as author on campground
    campground.author = req.user._id;

    // .save() returns a promise that we await on
    // save campground
    await campground.save();

    // flash message after successfully creating a new campground
    req.flash("success", "Succesfully created a new campground!");

    // redirect to newly created campground using campground id
    res.redirect(`/campgrounds/${campground._id}`);
}

// --------------------------------------------------------------------

// Reading data and show ----------------------------------------------

// show campground of id
module.exports.showCampground = async (req, res, next) => {
    // retrieve id from the parameters of the request
    // .findById() returns a promise that we await on
    // need to populate to obtain the contents of reviews since we only have their object ids
    // for each review, want to populate each author
    // populate author as well to obtain all contents of author
    const campground = await Campground.findById(req.params.id).populate({
        // nested populate to first populate all reviews and then populate on each one, their author
        path: "reviews",
        populate: {
            path: "author"
        }
    // then populate the author on the campground separately
    }).populate("author");

    // if the campground associated with id was not found
    if (!campground) {

        // then flash error message
        req.flash("error", "Cannot find that campground!");

        // and redirect to all campgrounds
        return res.redirect("/campgrounds");
    }

    // pass campgrounds through to our template
    // campgrounds is a folder with show.ejs
    res.render("campgrounds/show", { campground }); // compiles show template view and creates html output
}

// --------------------------------------------------------------------

// Upating campground --------------------------------------------------

// need id to look up the campground we are editing 
// view campground to edit
module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params; // destructures, gives the id of a campground
    
    // look up campground by id
    // .findById() returns a promise that we await on
    const campground = await Campground.findById(id);

    // if the campground associated with id was not found
    if (!campground) {

        // then flash error message
        req.flash("error", "Cannot find that campground!");

        // and redirect to all campgrounds
        return res.redirect("/campgrounds");
    }

    // pass campgrounds through to our template
    // campgrounds is a folder with edit.ejs
    res.render("campgrounds/edit", { campground }); // compiles edit template view and creates html output
}

// update campground
module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params; // destructures, gives the id of a campground

    // .findByIdAndUpdate() returns a promise that we await on
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // spread operator ... to spread object into other object 

    // have access to req.files to from the routes
    // need to loop over files and take the path and file name and add it to the campground
    // map over the req.files array to make a new object with the file's url and filename and put it in an array and call it imgs
    // upload images to be square by replacing /upload with /upload/w_1000,ar_1:1,c_fill,g_auto which is a certain square size
    const imgs = req.files.map(f => ({ url: f.path.replace("/upload", "/upload/w_1000,ar_1:1,c_fill,g_auto"), filename: f.filename }))

    // made a new array called imgs because we don't want to push an array into the images array, just want the data in the array
    // end up with however many images with those two properties and push it onto the existing images array, not overwrite all images which is what we did in createCampground
    // spread operator ..., pass it in as separate arguments to push into array
    campground.images.push(...imgs);

    // if there are any images to be deleted
    if (req.body.deleteImages) {
        // take each path name from deleteImages and delete it from Cloudinary as well as from our Mongo database 
        // just remove particular images

        // for each image to delete in deleteImages
        for (let filename of req.body.deleteImages) {
            // delete particular file in cloudinary using filename
            // the below deletes the images from Cloudinary
            await cloudinary.uploader.destroy(filename);
        }

        // $pull operator is how we pull elements out of an array
        // pull out of the images array where the file name of each image is in the deleteImages array from req.body
        // then update the campground that we are editing
        // the below deletes the images from Mongo
        await campground.updateOne({$pull: { images: { filename: {$in: req.body.deleteImages } } } } );
    }

    // .save() returns a promise that we await on
    // save campground
    await campground.save();

    // flash message after successfully updating a new campground
    req.flash("success", "Successfully updated campground!");

    // redirect to campground we just updated
    res.redirect(`/campgrounds/${campground._id}`);
}

// ---------------------------------------------------------------------

// Delete campground ---------------------------------------------------

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params; // destructures, gives the id of a campground

    // delete campground by ID
    // if we change findByIDAndDelete it will not trigger the findOneAndDelete middleware in campgrounds.js
    const campground = await Campground.findByIdAndDelete(id);

    // delete images from cloudinary too if a campground is deleted
    for (let image of campground.images) {
        await cloudinary.uploader.destroy(image.filename);
    } 

    // flash message after successfully creating a campground
    req.flash("success", "Successfully deleted campground!");

    // redirect to all campgorunds
    res.redirect("/campgrounds");
}