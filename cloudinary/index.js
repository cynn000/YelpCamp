// Index file for Cloudinary

const cloudinary = require("cloudinary").v2; // load the cloudinary module
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // load the cloudinaryStorage moudle

// set our config for cloudinary
// associating our account with this cloud in every instance
cloudinary.config({
    // these values are from the .env file
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// instantiate an instance of cloudinary storage
// setting up an instance of cloudinary storage in this file
// pass in the cloudinary object we configured above
// folder is the folder in cloudinary that should store things in
// allowedFormats the allowed formats of the files
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "YelpCamp",
        allowedFormats: ["jpg", "jpeg", "png"]
    }
});

// export both objects to be used in other files
module.exports = {
    cloudinary,
    storage
}