const twilio = require("twilio");

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;
  if (!sid || !token || !from) return null;
  return { client: twilio(sid, token), from };
}

function getBaseUrl() {
  return process.env.BASE_URL || "https://899a-66-253-168-123.ngrok-free.app";
}

function sendSMS(to, body) {
  const t = getClient();
  if (!t) { console.error("Twilio env vars not set, skipping SMS"); return Promise.resolve(false); }
  return t.client.messages.create({ body, from: t.from, to })
    .then((msg) => { console.log(`SMS sent to ${to} (sid: ${msg.sid})`); return true; })
    .catch((err) => { console.error(`SMS to ${to} failed:`, err.message); return false; });
}

function sendAlertToUser(user) {
  const url = getBaseUrl();
  const body = `FLOOD WATCH ALERT: A flood watch has been issued in your area. Do you need help evacuating? Open the app to respond: ${url}/v2`;
  return sendSMS(user.phone, body);
}

function sendNeighborSMS(user) {
  if (!user.neighborPhone) {
    console.log(`No neighbor phone for ${user.name}, skipping SMS`);
    return Promise.resolve(false);
  }

  const phones = user.neighborPhone.split(",").map((p) => p.trim()).filter(Boolean);
  if (phones.length === 0) return Promise.resolve(false);

  const url = getBaseUrl();
  const disability = user.disability || "no listed disability";
  const meds = user.medications || "none listed";
  const body = `EMERGENCY: ${user.name} at ${user.address} floor ${user.floor} needs help evacuating. They have ${disability}. Their medications: ${meds}. Tap to respond: ${url}/neighbor?id=${user.id}`;

  const sends = phones.map((phone) => sendSMS(phone, body));
  return Promise.all(sends).then((results) => results.some(Boolean));
}

module.exports = { sendSMS, sendAlertToUser, sendNeighborSMS };
