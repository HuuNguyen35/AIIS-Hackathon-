const VAPI_URL = "https://api.vapi.ai/call/phone";

async function callNeighbor(user) {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    console.error("VAPI_API_KEY not set, skipping Vapi calls");
    return;
  }

  if (!user.neighborPhone) {
    console.log(`No neighbor phone for ${user.name}, skipping Vapi calls`);
    return;
  }

  const phones = user.neighborPhone.split(",").map((p) => p.trim()).filter(Boolean);
  const disability = user.disability || "no listed disability";
  const medications = user.medications || "none listed";

  for (const phone of phones) {
    try {
      const payload = {
        assistantId: "9f48165f-47e8-417e-b606-acd17f6a61e6",
        phoneNumberId: "2a6fae8f-658b-49f0-b856-b2736d971f58",
        customer: { number: phone },
        assistantOverrides: {
          firstMessage: `Hi, this is an emergency alert from HandsOnDeck. Your neighbor ${user.name} at ${user.address} floor ${user.floor} needs help evacuating. They have ${disability}. Please open the HandsOnDeck app to see their full profile and confirm you can help.`,
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
        console.error(`Vapi call to ${phone} failed: ${res.status} ${text}`);
      } else {
        const data = await res.json();
        console.log(`Vapi call initiated to ${phone}, callId: ${data.id}`);
      }
    } catch (err) {
      console.error(`Vapi call to ${phone} error:`, err.message);
    }
  }
}

module.exports = { callNeighbor };
