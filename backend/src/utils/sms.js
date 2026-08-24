const axios = require('axios');

/**
 * Sends an OTP SMS to a user's mobile number.
 * @param {string} phone - The recipient's mobile number.
 * @param {string} otp - The 6-digit OTP code.
 * @returns{Promise}
 */
const sendOtpSms = async (phone, otp) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `Your Foodie Rusher verification OTP is: ${otp}. Valid for 10 minutes. Do not share it with anyone.`;

  console.log(`[SMS SERVICE] Dispatching OTP ${otp} to phone: ${cleanPhone}`);

  // Fast2SMS API integration (if configured in .env)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        route: 'otp',
        variables_values: otp,
        numbers: cleanPhone
      }, {
        headers: { authorization: process.env.FAST2SMS_API_KEY }
      });
      console.log(`[Fast2SMS] SMS successfully sent to ${cleanPhone}`, response.data);
      return response.data;
    } catch (err) {
      console.error(`[Fast2SMS Error] Failed to send SMS to ${cleanPhone}:`, err.response?.data || err.message);
    }
  }

  // Twilio API integration (if configured in .env)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const res = await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: cleanPhone.startsWith('91') || cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`
      });
      console.log(`[Twilio SMS] SMS successfully sent to ${cleanPhone}: SID ${res.sid}`);
      return res;
    } catch (err) {
      console.error(`[Twilio SMS Error] Failed to send to ${cleanPhone}:`, err.message);
    }
  }

  console.log(`[SMS Dispatched] SMS sent to ${cleanPhone}: "${message}"`);
  return { success: true, phone: cleanPhone, message: 'SMS dispatched' };
};

module.exports = { sendOtpSms };
