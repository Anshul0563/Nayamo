/**
 * Async Handler - Wraps async route handlers to catch errors
 * Eliminates need for try-catch in every controller
 * Catches both sync throws and async rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve()
    .then(() => fn(req, res, next))
    .catch(next);
};

module.exports = asyncHandler;
