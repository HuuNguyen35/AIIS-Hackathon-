const express = require("express");
const { updateUser } = require("../db/store");

const router = express.Router();

const VALID_STATUSES = ["uncontacted", "neighbor_en_route", "safe"];

router.post("/", (req, res) => {
  try {
    const { id, status, transcript } = req.body;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const updates = {};
    if (status) updates.status = status;
    if (transcript !== undefined) updates.transcript = transcript;

    const user = updateUser(id, updates);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

module.exports = router;
