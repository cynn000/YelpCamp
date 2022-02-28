// File for our schemas

const BaseJoi = require("joi"); // load the joi module. JOI is a JavaScript validator tool to write validations
const sanitizeHtml = require("sanitize-html"); // load the sanitize html module which sanitizes inputs

// cross site scripting vulnerability
// idea is to inject some client side script into somebody else's webpage.
// some attacker can inject their own client side code their own scripts that will run in the browser on somebody else's application.
// sanitize our input to make sure if someone creates or edits a campground, they cannot include any sort of HTML elements
// defining an extension on joi.string() called escapeHTML
// package sanitize-html does the job of sanitizing the inputs, strip the html tags or script tags, etc away
const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    // very stricit, nothing is allowed
                    allowedTags: [],
                    allowedAttributes: {},
                });
                // check to see if there is a difference between the input that was passed in and the sanitized output
                if (clean !== value) {
                    // if there was a different, that means something was removed
                    // return message
                    return helpers.error("string.escapeHTML", { value })
                }
                else {
                    // otherwise no difference, return clean input
                    return clean;
                }
            }
        }
    }
});

// Joi is now the old version, the base version of joy but extended with the new extension
// now gives the option of using .escapeHTML() use it anytime we have text
const Joi = BaseJoi.extend(extension);

// this is not a mongoose schema
// this is going to validate our data before wen even atttempt to save it with mongoose
// validation on server side
// module exports this campgroundSchema to be used in other files
module.exports.campgroundSchema = Joi.object({
    // campground is a joi object and is required
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    // deleteImages is an array that is not required for when we want to edit a campground and delete images
    deleteImages: Joi.array()
});

// validation server side
// module exports this reviewSchema to be used in other files
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});

