const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "users.json");

function readUsers() {
  const data = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function findUser(id) {
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

function updateUser(id, updates) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  writeUsers(users);
  return users[idx];
}

module.exports = { readUsers, writeUsers, findUser, updateUser };
