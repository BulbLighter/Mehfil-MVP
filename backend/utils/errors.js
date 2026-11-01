const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

module.exports = { ERROR_CODES, sendError };
