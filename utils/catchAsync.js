
// Async error handling

// module.exports exports this function to be used in other files.
// this is our async error handling function
// return a function that accepts a function and then it will execute that function
// catches any errors and passes it to next if there is an error
// will use to to wrap our asynchronous functions
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}