const express = require("express");
const { readUsers } = require("../db/store");
const { getCurrentAlert } = require("../services/nws");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    let users = readUsers();

    if (req.query.status) {
      users = users.filter((u) => u.status === req.query.status);
    }

    const alert = getCurrentAlert();
    res.json({ users, alert });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

module.exports = router;
