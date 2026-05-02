const { readUsers } = require("../db/store");

const VAPI_URL = "https://api.vapi.ai/call/phone";

async function triggerDisaster(alert) {
  const users = readUsers();
  console.log(`Triggering disaster calls for ${users.length} users — ${alert.event}`);

  for (const user of users) {
    try {
      await makeCall(user, alert);
    } catch (err) {
      console.error(`Failed to call ${user.name}:`, err.message);
    }
  }
}

async function makeCall(user, alert) {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    console.error("VAPI_API_KEY not set, skipping call");
    return;
  }

  const payload = {
    assistantId: "9f48165f-47e8-417e-b606-acd17f6a61e6",
    customer: {
      number: user.phone,
    },
    assistantOverrides: {
      metadata: { userId: user.id },
      firstMessage: `Hi ${user.name}, this is an emergency alert. A ${alert.event} has been detected in your area. Are you okay and do you need help evacuating?`,
      model: {
        messages: [
          {
            role: "system",
            content: [
              `You are an emergency response assistant calling ${user.name}.`,
              `They live on floor ${user.floor}.`,
              user.disability ? `They have a disability: ${user.disability}.` : "",
              user.medications ? `Their medications: ${user.medications}.` : "",
              `A ${alert.event} has been detected. Your job is to determine if they are safe or need evacuation help.`,
              "Be calm, clear, and brief. Ask if they need help evacuating.",
            ]
              .filter(Boolean)
              .join(" "),
          },
        ],
      },
    },
  };

  const res = await fetch(VAPI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vapi API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log(`Call initiated for ${user.name} (${user.phone}), callId: ${data.id}`);
  return data;
}

module.exports = { triggerDisaster };
