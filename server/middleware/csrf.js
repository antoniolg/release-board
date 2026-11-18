const crypto = require("crypto");

// Double-submit cookie CSRF protection: GET /api/csrf-token sets an HttpOnly
// cookie and returns the same token, which the client sends back in the
// X-CSRF-Token header on every state-changing request.
const COOKIE_NAME = "_csrf";
const HEADER_NAME = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return undefined;
}

function tokensMatch(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function issueCsrfToken(req, res) {
  let token = readCookie(req, COOKIE_NAME);
  if (!token || !TOKEN_PATTERN.test(token)) {
    token = crypto.randomBytes(32).toString("hex");
  }
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ csrfToken: token });
}

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = readCookie(req, COOKIE_NAME);
  const headerToken = req.headers[HEADER_NAME];
  if (cookieToken && TOKEN_PATTERN.test(cookieToken) && tokensMatch(cookieToken, headerToken)) {
    return next();
  }

  const err = new Error("invalid csrf token");
  err.code = "EBADCSRFTOKEN";
  err.status = 403;
  next(err);
}

module.exports = { csrfProtection, issueCsrfToken };
