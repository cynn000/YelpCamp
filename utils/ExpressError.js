
// Error handling

class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

// module exports class ExpressError to be used in other files
module.exports = ExpressError;