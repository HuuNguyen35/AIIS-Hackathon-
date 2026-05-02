const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readUsers, writeUsers } = require("../db/store");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { name, address, floor, lat, lng, disability, medications, phone, neighborPhone, neighborPhones } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone are required" });
    }

    const user = {
      id: uuidv4(),
      name,
      address: address || "",
      floor: floor || 0,
      lat: lat || 0,
      lng: lng || 0,
      disability: disability || "",
      medications: medications || "",
      phone,
      neighborPhone: Array.isArray(neighborPhones) ? neighborPhones.filter(Boolean).join(",") : (neighborPhone || ""),
      status: "uncontacted",
      transcript: "",
      updatedAt: new Date().toISOString(),
    };

    const users = readUsers();
    users.push(user);
    writeUsers(users);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to register user", details: err.message });
  }
});

module.exports = router;
