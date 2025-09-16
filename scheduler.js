const cron = require("node-cron");
const { exec } = require("child_process");
const axios = require("axios");
require("dotenv").config();

const teamsWebhook = process.env.TEAMS_WEBHOOK_URL;

// Helper: Send results to Teams
function sendToTeams(message) {
  axios.post(teamsWebhook, { text: message })
    .then(() => console.log("✅ Sent to Teams"))
    .catch(err => console.error("❌ Teams error:", err));
}

// 🔹 Smoke tests at 9 AM daily
cron.schedule("0 9 * * *", () => {
  console.log("⏳ Running smoke tests...");
  exec("npx playwright test --grep @smoke --reporter=line", (error, stdout, stderr) => {
    if (error) {
      sendToTeams(`❌ Smoke tests failed:\n${stderr}`);
    } else {
      sendToTeams(`✅ Smoke tests passed:\n${stdout}`);
    }
  });
});

// 🔹 Full tests at 6 PM daily
cron.schedule("0 18 * * *", () => {
  console.log("⏳ Running full test suite...");
  exec("npx playwright test --reporter=line", (error, stdout, stderr) => {
    if (error) {
      sendToTeams(`❌ Full test suite failed:\n${stderr}`);
    } else {
      sendToTeams(`✅ Full test suite passed:\n${stdout}`);
    }
  });
});
