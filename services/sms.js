const twilio = require("twilio");

function sendNeighborSMS(user) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;

  if (!sid || !authToken || !from) {
    console.error("Twilio env vars not set, skipping SMS");
    return Promise.resolve();
  }

  if (!user.neighborPhone) {
    console.log(`No neighbor phone for ${user.name}, skipping SMS`);
    return Promise.resolve();
  }

  const client = twilio(sid, authToken);
  const disability = user.disability || "no listed disability";
  const body = `EMERGENCY ALERT: ${user.name} at ${user.address} floor ${user.floor} needs help evacuating. They have ${disability}. Please check on them immediately or call 911.`;

  return client.messages
    .create({ body, from, to: user.neighborPhone })
    .then(function (msg) {
      console.log(`SMS sent to ${user.neighborPhone} (sid: ${msg.sid})`);
    })
    .catch(function (err) {
      console.error(`SMS to ${user.neighborPhone} failed:`, err.message);
    });
}

module.exports = { sendNeighborSMS };
