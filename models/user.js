// User model

const mongoose = require("mongoose"); // load the mongoose module
const passportLocalMongoose = require("passport-local-mongoose"); // load the passport-local-mongoose module

// reference to mongoose.schema called Schema, shortcut to reference
// instead of having to write mongoose.Schema all the time
const Schema = mongoose.Schema;

// defining user schema, how a user is structured
// need username, email, and password
// only defining email, using passport-local-mongoose to add username and passport
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// pass in the result of requiring the passport-local-mongoose package
// this is going to add on to our schema a username and a field for password
// it is going to ensure they are unique and not duplicated
UserSchema.plugin(passportLocalMongoose);

// compile the model to be used in other files
module.exports = mongoose.model("User", UserSchema);