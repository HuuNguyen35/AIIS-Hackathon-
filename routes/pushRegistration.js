const express = require("express");
const { updateUser } = require("../db/store");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { id, token } = req.body;

    if (!id || !token) {
      return res.status(400).json({ error: "id and token are required" });
    }

    const user = updateUser(id, { pushToken: token });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to save push token", details: err.message });
  }
});

module.exports = router;
