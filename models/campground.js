// Campground model

const mongoose = require("mongoose"); // load the mongoose module
const Review = require("./review"); // load the review model

// reference to mongoose.schema called Schema, shortcut to reference
// instead of having to write mongoose.Schema all the time
const Schema = mongoose.Schema; 

// image consists of a url (url is the path to the image) and filename
const ImageSchema = new Schema ( {
        url: String,
        filename: String
});

// use Cloudinary's Transformation API to request a modified version, a small thumbnail version.
// use .virtual because its dervied from the information we're already storing
// after /upload set some width to create a small thumbnail
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload/w_1000,ar_1:1,c_fill,g_auto", "/upload/ar_4:2,c_fill,w_200");
});

// options to include virtuals when you convert a document to JSON
// this is for the popUpMarkup on the cluster map
const opts = { toJSON: { virtuals: true } };

// defines what a campground is
// images is an array of images
// reviews is to embed review object ids in a single campground
// reviews is an array of object ids that correspond to a single review
const CampgroundSchema = new Schema ( {
    title: String,
    images: [
        ImageSchema
    ],
    // geometry is GeoJSON which follows format: type field of type Point (ALWAYS) and coordinates [longitute, latitude] an array
    geometry: {
        // type is Point and required
        type: {
            // only possible type for type is Point
            type: String,
            enum: ["Point"], // type has to be the string Point
            required: true
        },
        // array of numbers and required
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId, // type of objectid
        ref: "User"                  // references the user instance
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, // type of objectid
            ref: "Review"                // references the review model
        }
    ]
}, opts); // pass options here to include virtuals will now be able to access it from inside our Mapbo code

// register virtual property
// need to conform data to match pattern again to have a properties key and add popupMarkup
// so we can use it in the popup in clusterMap.js
// end goal is to have:
/* properties: {
        popUpMarkup: "<h3></h3>"
}
 included in our CampgroundSchema
*/
// to nest something we do properties.popUpMarkup
// by default Mongoose does not include virtuals when you convert a document to JSON
// we need to set an option
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
    // popup text is set to an anchor tag bolded that displays campground name and is a link that links to the campground's show page
    // and description that is truncated
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 30)}...</p>`;
});

// Mongoose Middleware
// findOneAndDelete is a query middleware and is triggered by findByIdAndDelete() when a campground is deleted
// .post - executes after the findByIdAndDelete which deletes a campground by ID
// doc, which is passed in, is the deleted document, it is passed in to the function
// take all of the reviews in the array called reviews, take all the IDs and delete every review with that matching ID
// delete associated reviews for a given campground
// if we did not delete reviews like this and just deleted the campground, the reviews would still exist and be essentially orphans
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    // if something was found and deleted
    if (doc) {
        // delete all reviews where their id field is in our document that was just deleted in its reviews array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

// module.exports exports Campground model with schema to be used in other files
// mongoose.model creates a collection of Campground with schema CampgroundSchema
module.exports = mongoose.model("Campground", CampgroundSchema);