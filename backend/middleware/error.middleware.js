const { HttpError } = require("../utils/httpError");

function errorMiddleware(err, req, res, next) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err?.message || "Server error";

  if (status >= 500) console.error("[error]", err);

  res.status(status).json({ message });
}

module.exports = errorMiddleware;