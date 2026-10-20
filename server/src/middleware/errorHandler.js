// Runs when no route matched.
export function notFound(req, res) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` });
}

// Runs when any route throws or calls next(err).
// Express 5 also sends rejected promises from async routes here, so routes don't need try/catch.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Duplicate key from a unique index, e.g. an email that is already registered
  if (err.code === 11000) return res.status(409).json({ message: 'That already exists.' });
  // Mongoose validation (missing field, bad format)
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0].message });

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Something went wrong on the server.' : err.message });
}

// Small helper to throw an error with an HTTP status: throw httpError(400, 'Bad input')
export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
