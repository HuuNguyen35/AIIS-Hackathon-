const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readUsers, writeUsers } = require("../db/store");
const { normalizePhone } = require("../services/phone");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { name, address, floor, lat, lng, disability, medications, phone, neighborPhone, neighborPhones } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push("name is required");
    if (!phone || !phone.trim()) errors.push("phone is required");
    if (!address || !address.trim()) errors.push("address is required");
    if (floor === undefined || floor === null || floor === "") errors.push("floor is required");

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    let neighborPhoneStr = "";
    if (Array.isArray(neighborPhones)) {
      neighborPhoneStr = neighborPhones.map(normalizePhone).filter(Boolean).join(",");
    } else if (neighborPhone) {
      neighborPhoneStr = normalizePhone(neighborPhone);
    }

    const user = {
      id: uuidv4(),
      name: name.trim(),
      address: address.trim(),
      floor: parseInt(floor, 10) || 0,
      lat: lat || 0,
      lng: lng || 0,
      disability: disability || "",
      medications: medications || "",
      phone: normalizePhone(phone),
      neighborPhone: neighborPhoneStr,
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
