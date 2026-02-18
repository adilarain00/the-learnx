"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class errorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map