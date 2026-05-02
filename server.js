require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const registerRouter = require("./routes/register");
const statusRouter = require("./routes/status");
const usersRouter = require("./routes/users");
const transcriptsRouter = require("./routes/transcripts");
const webhookRouter = require("./routes/webhook");
const pushRouter = require("./routes/pushRegistration");
const { startPolling, getCurrentAlert, setCurrentAlert } = require("./services/nws");
const { sendAlertToUser, sendNeighborSMS } = require("./services/sms");
const { readUsers, findUser, updateUser } = require("./db/store");

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
  res.json({ service: "HandsOnDeck Disaster Response API", status: "running" });
});

app.get("/app", (_req, res) => {
  res.sendFile(path.join(__dirname, "mobile-app.html"));
});

app.get("/v2", (_req, res) => {
  res.sendFile(path.join(__dirname, "webapp", "index.html"));
});

app.get("/neighbor", (_req, res) => {
  res.sendFile(path.join(__dirname, "neighbor.html"));
});

app.get("/demo/anh", (_req, res) => {
  res.sendFile(path.join(__dirname, "demo-anh.html"));
});

app.get("/demo/tin", (_req, res) => {
  res.sendFile(path.join(__dirname, "demo-tin.html"));
});

app.get("/demo/gavin", (_req, res) => {
  res.sendFile(path.join(__dirname, "demo-gavin.html"));
});

app.get("/alert", (_req, res) => {
  res.json({ alert: getCurrentAlert() });
});

app.post("/notify/:id", async (req, res) => {
  try {
    const user = findUser(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const smsSent = await sendNeighborSMS(user);
    if (smsSent) {
      updateUser(user.id, { status: "neighbor_en_route" });
    }
    res.json({ notified: true, smsSent, user: { id: user.id, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/test-trigger", async (_req, res) => {
  try {
    const alert = {
      event: "Flood Watch",
      headline: "Flood Watch issued for Bexar County, San Antonio TX",
      description: "TEST ALERT — Manual trigger for development testing.",
    };
    setCurrentAlert({ name: alert.event, county: "Bexar County, TX" });

    const users = readUsers();
    let sent = 0;
    for (const user of users) {
      if (user.address === "Volunteer") continue;
      const ok = await sendAlertToUser(user);
      if (ok) sent++;
    }

    console.log(`Flood watch triggered. SMS sent to ${sent}/${users.length} users.`);
    res.json({ triggered: true, alert, smsSent: sent });
  } catch (err) {
    res.status(500).json({ error: "Trigger failed", details: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`HandsOnDeck server running on port ${PORT}`);
  startPolling();
});
