const twilio = require("twilio");

function sendNeighborSMS(user) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;

  if (!sid || !authToken || !from) {
    console.error("Twilio env vars not set, skipping SMS");
    return Promise.resolve(false);
  }

  if (!user.neighborPhone) {
    console.log(`No neighbor phone for ${user.name}, skipping SMS`);
    return Promise.resolve(false);
  }

  const phones = user.neighborPhone.split(",").map((p) => p.trim()).filter(Boolean);
  if (phones.length === 0) {
    console.log(`No valid neighbor phones for ${user.name}, skipping SMS`);
    return Promise.resolve(false);
  }

  const baseUrl = process.env.BASE_URL || "https://4597-66-253-168-123.ngrok-free.app";
  const client = twilio(sid, authToken);
  const disability = user.disability || "no listed disability";
  const body = `EMERGENCY ALERT: ${user.name} at ${user.address} floor ${user.floor} needs help evacuating. They have ${disability}. Tap this link to respond: ${baseUrl}/neighbor?id=${user.id}`;

  const sends = phones.map((phone) =>
    client.messages
      .create({ body, from, to: phone })
      .then((msg) => {
        console.log(`SMS sent to ${phone} (sid: ${msg.sid})`);
        return true;
      })
      .catch((err) => {
        console.error(`SMS to ${phone} failed:`, err.message);
        return false;
      })
  );

  return Promise.all(sends).then((results) => results.some(Boolean));
}

module.exports = { sendNeighborSMS };
