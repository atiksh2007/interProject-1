const rateLimit = require("express-rate-limit");

module.exports = {
  apiLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: "Too many requests, please slow down." },
  }),
  authLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many auth attempts, try again later." },
  }),
};
