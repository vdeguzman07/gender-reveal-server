class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.message =
      typeof message === "boolean" ? JSON.parse(this.message) : this.message;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isKnownError = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
