// MOCK ONLY: replace with real SMS provider (e.g. Twilio) before production
const MOCK_OTP_CODE = '123456';
const MOCK_DELAY_MS = 500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendOTP(phone) {
  await delay(MOCK_DELAY_MS);
  console.log(`[MOCK OTP] Sent code to ${phone}`);
  return { sent: true };
}

async function verifyOTP(phone, code) {
  await delay(MOCK_DELAY_MS);
  return String(code) === MOCK_OTP_CODE;
}

module.exports = { sendOTP, verifyOTP };

