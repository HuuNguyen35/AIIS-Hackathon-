require("dotenv").config();
const express = require("express");
const cors = require("cors");
const registerRouter = require("./routes/register");
const statusRouter = require("./routes/status");
const usersRouter = require("./routes/users");
const transcriptsRouter = require("./routes/transcripts");
const webhookRouter = require("./routes/webhook");
const { startPolling } = require("./services/nws");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/register", registerRouter);
app.use("/status", statusRouter);
app.use("/users", usersRouter);
app.use("/transcripts", transcriptsRouter);
app.use("/webhook", webhookRouter);

app.get("/", (_req, res) => {
  res.json({ service: "Block Disaster Response API", status: "running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Block server running on port ${PORT}`);
  startPolling();
});
