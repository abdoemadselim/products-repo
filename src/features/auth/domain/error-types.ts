import { HttpException } from "#lib/error-handling/error-types.js";

export class LoginException extends HttpException {
    constructor() {
        super(401, 10, "The email address or password you entered is incorrect.", "LOGIN_EXCEPTION");

        this.name = this.constructor.name;
        Error.captureStackTrace(this);
    }
}

export class UnVerifiedException extends HttpException {
    constructor() {
        super(403, 11, "Your email address has not been verified.", "EMAIL_UNVERIFIED");

        this.name = this.constructor.name;
        Error.captureStackTrace(this);
    }
}
