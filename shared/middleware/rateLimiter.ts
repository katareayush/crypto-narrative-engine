import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for expensive endpoints
export const heavyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many requests for this resource, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for POST endpoints
export const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many POST requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});