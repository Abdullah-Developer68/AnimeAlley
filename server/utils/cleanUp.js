const cron = require("node-cron");
const userModel = require("../models/user.model.js");

// Runs every day at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    const result = await userModel.deleteMany({
      role: "verifying",
      createdAt: { $lt: oneWeekAgo },
    });
  } catch (err) {
    console.error("[CLEANUP] Error deleting unverified users:", err);
  }
});
