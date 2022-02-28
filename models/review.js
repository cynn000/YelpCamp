// Reviews Model
// Going to embed an array of object ids in each campground
// One to Many Relationship, one campground has many reviews

const mongoose = require("mongoose"); // load the mongoose module

// reference to mongoose.schema called Schema, shortcut to reference
// instead of having to write mongoose.Schema all the time
const Schema = mongoose.Schema;

// define the review schema, defines what a review is
// added in author
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId, // type of objectid
        ref: "User"                  // references the user instance
    }
});

// module.exports exports Review model with schema to be used in other files
// mongoose.model creates a collection of Review with schema reviewSchema
module.exports = mongoose.model("Review", reviewSchema);