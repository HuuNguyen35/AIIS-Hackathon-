const express = require("express");
const { readUsers } = require("../db/store");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const users = readUsers()
      .filter((u) => u.transcript && u.transcript.trim() !== "")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transcripts", details: err.message });
  }
});

module.exports = router;
