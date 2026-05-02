const express = require("express");
const { updateUser, findUser } = require("../db/store");
const { notifyNearbyUsers } = require("../services/notify");

const router = express.Router();

router.post("/vapi", (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.type !== "end-of-call-report") {
      return res.status(200).json({ received: true });
    }

    const userId = message.call?.assistantOverrides?.metadata?.userId;
    if (!userId) {
      return res.status(400).json({ error: "No userId in call metadata" });
    }

    const transcript = message.transcript || "";
    const needsHelp = /help|stuck|can't move|trapped|need.*assist|evacuate/i.test(transcript);
    const status = needsHelp ? "uncontacted" : "safe";

    const user = updateUser(userId, { transcript, status });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (needsHelp) {
      notifyNearbyUsers(user);
    }

    res.json({ received: true, user });
  } catch (err) {
    res.status(500).json({ error: "Webhook processing failed", details: err.message });
  }
});

module.exports = router;
