import HttpError from "../models/http-error.js";

const errorHandler = (err, req, res, next) => {
  res.status(err.code).json({
    success: false,
    message: err.message,
    status: err.code,
  });
};

const notFound = (req, res, next) => {
  const error = new HttpError(`${req.originalUrl} Not found`, 404);
  res.status(404);
  next(error);
};

export { errorHandler, notFound };
