class ApiError extends Error {
    constructor(
        statusCode,
        message = "SOmething went wrong",
        error = [],
        stack = ""
    ) {
        super(message)//overright
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = error

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };