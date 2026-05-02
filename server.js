require("dotenv").config();
const express = require("express");
const cors = require("cors");
const registerRouter = require("./routes/register");
const statusRouter = require("./routes/status");
const usersRouter = require("./routes/users");
const transcriptsRouter = require("./routes/transcripts");
const webhookRouter = require("./routes/webhook");
const pushRouter = require("./routes/pushRegistration");
const path = require("path");
const { startPolling } = require("./services/nws");
const { triggerDisaster, callSingleUser } = require("./services/vapi");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/register", registerRouter);
app.use("/status", statusRouter);
app.use("/users", usersRouter);
app.use("/transcripts", transcriptsRouter);
app.use("/webhook", webhookRouter);
app.use("/push-token", pushRouter);

app.get("/", (_req, res) => {
  res.json({ service: "Block Disaster Response API", status: "running" });
});

app.get("/app", (_req, res) => {
  res.sendFile(path.join(__dirname, "mobile-app.html"));
});

app.post("/call/:id", async (req, res) => {
  try {
    const user = await callSingleUser(req.params.id);
    res.json({ called: true, user: { id: user.id, name: user.name, phone: user.phone } });
  } catch (err) {
    res.status(err.message === "User not found" ? 404 : 500).json({ error: err.message });
  }
});

app.post("/test-trigger", async (_req, res) => {
  try {
    const alert = {
      event: "Flood Watch",
      headline: "Flood Watch issued for Bexar County, San Antonio TX",
      description: "TEST ALERT — Manual trigger for development testing.",
    };
    triggerDisaster(alert);
    res.json({ triggered: true, alert });
  } catch (err) {
    res.status(500).json({ error: "Trigger failed", details: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Block server running on port ${PORT}`);
  startPolling();
});
