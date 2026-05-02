const NWS_URL = "https://api.weather.gov/alerts/active";
const POLL_INTERVAL = 60_000;
const ALERT_TYPES = ["Flood Watch", "Excessive Heat Warning", "Tornado Warning"];

let previousAlertIds = new Set();
let currentAlert = null;

function setCurrentAlert(alert) {
  currentAlert = alert;
}

function getCurrentAlert() {
  return currentAlert;
}

async function fetchAlerts() {
  try {
    const res = await fetch(NWS_URL, {
      headers: { "User-Agent": "BlockDisasterApp/1.0" },
    });
    if (!res.ok) { console.error(`NWS API returned ${res.status}`); return []; }
    const data = await res.json();
    return data.features || [];
  } catch (err) {
    console.error("NWS fetch error:", err.message);
    return [];
  }
}

async function poll() {
  const features = await fetchAlerts();
  const relevant = features.filter((f) => ALERT_TYPES.includes(f.properties?.event));

  if (relevant.length > 0) {
    const latest = relevant[0].properties;
    const areas = latest.areaDesc || "";
    const county = areas.split(";")[0].trim();
    currentAlert = { name: latest.event, county };
  }

  for (const feature of relevant) {
    const alertId = feature.properties?.id || feature.id;
    if (!previousAlertIds.has(alertId)) {
      console.log(`New alert detected: ${feature.properties.event} — ${feature.properties.headline}`);
      previousAlertIds.add(alertId);
    }
  }
}

function startPolling() {
  console.log("NWS alert polling started (every 60s)");
  poll();
  setInterval(poll, POLL_INTERVAL);
}

module.exports = { startPolling, getCurrentAlert, setCurrentAlert };
