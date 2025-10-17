export type FieldErrorsType = Record<string, { message: string }>

export class HttpException extends Error {
    statusCode: number
    responseCode: number
    errorCodeString: string

    constructor(statusCode: number, responseCode: number, message: string, errorCodeString: string) {
        super(message)

        this.statusCode = statusCode
        this.responseCode = responseCode
        this.errorCodeString = errorCodeString

        // For debugging purposes — makes it easier to identify the error type (e.g., RateLimitingException)
        this.name = this.constructor.name

        // Starts the stack trace from this class, omitting the parent constructor
        Error.captureStackTrace(this)
    }
}

export class InternalServerException extends HttpException {
    static STATUS_CODE: number = 500
    static RESPONSE_CODE: number = 4
    static MESSAGE: string = "An unexpected server error occurred. Please try again later."
    static ERROR_CODE_STRING: string = "INTERNAL_SERVER_ERROR"

    constructor() {
        super(
            InternalServerException.STATUS_CODE,
            InternalServerException.RESPONSE_CODE,
            InternalServerException.MESSAGE,
            InternalServerException.ERROR_CODE_STRING
        )
    }
}

export class RateLimitingException extends HttpException {
    constructor() {
        super(
            429,
            5,
            "You’ve made too many requests in a short period. Please wait a moment and try again.",
            "RATE_LIMIT_EXCEEDED"
        )
        this.name = this.constructor.name
        Error.captureStackTrace(this)
    }
}

export class MethodNotAllowedException extends HttpException {
    constructor() {
        super(
            405,
            2,
            "The HTTP method used is not allowed for this route.",
            "METHOD_NOT_ALLOWED"
        )
        this.name = this.constructor.name
        Error.captureStackTrace(this)
    }
}

export class UnAuthorizedException extends HttpException {
    constructor(message?: string) {
        super(
            401,
            2,
            message || "You are not authorized to perform this action on this resource.",
            "UNAUTHORIZED"
        )
        this.name = this.constructor.name
        Error.captureStackTrace(this)
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string, errorCodeString?: string) {
        super(
            404,
            6,
            message,
            errorCodeString || "NOT_FOUND"
        )
        this.name = this.constructor.name
        Error.captureStackTrace(this)
    }
}

export class ValidationException extends HttpException {
    FieldErrors: FieldErrorsType
    errors?: string[]

    constructor(FieldErrors: FieldErrorsType, errors?: string[]) {
        super(
            422,
            3,
            "There was an error validating the provided data.",
            "VALIDATION_ERROR"
        )
        this.FieldErrors = FieldErrors
        this.errors = errors

        this.name = this.constructor.name
        Error.captureStackTrace(this)
    }
}

export class NoException {
    static NoErrorCode: number = 0
    static NoErrorCodeString: string = "NO_ERROR"
}

export class ConflictException extends HttpException {
    constructor(message: string) {
        super(
            409,
            7,
            message || "There is a conflict with the current state of the resource.",
            "CONFLICT"
        )

        this.name = this.constructor.name
        Error.captureStackTrace(this)
    }
}

export class ResourceExpiredException extends HttpException {
    static STATUS_CODE: number = 401
    static RESPONSE_CODE: number = 8

    constructor(message: string) {
        super(
            401,
            8,
            message || "Access to this resource has expired.",
            "RESOURCE_EXPIRED"
        )

        this.name = this.constructor.name
        Error.captureStackTrace(this)
    }
}
