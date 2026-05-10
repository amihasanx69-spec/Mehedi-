const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "azan",
    version: "2.1.0",
    author: "Mr.King",
    countDown: 0,
    role: 0,
    shortDescription: { en: "Auto Azan & Namaz Reminder" },
    category: "islam",
    guide: { en: "{pn} on | {pn} off" }
  },

  onStart: async function ({ api, event, args, threadsData, message }) {
    const { threadID, senderID } = event;

    // ✅ NEW ADMIN UID
    const adminUID = "61588972996269";

    const threadData = await threadsData.get(threadID);
    const data = threadData.data || {};

    if (args[0] === "on") {
      if (senderID !== adminUID)
        return message.reply("⛔ Access Denied! Only owner can enable this.");

      data.azanStatus = true;
      await threadsData.set(threadID, { data });

      return message.reply("🕌 Azan Reminder ENABLED ✨");
    }

    if (args[0] === "off") {
      if (senderID !== adminUID)
        return message.reply("⛔ Access Denied! Only owner can disable this.");

      data.azanStatus = false;
      await threadsData.set(threadID, { data });

      return message.reply("❌ Azan Reminder DISABLED.");
    }

    // Prayer time manual check
    try {
      const res = await axios.get(
        "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2"
      );

      const timings = res.data.data.timings;

      const msg =
`🕌 PRAYER TIMES (Dhaka)
──────────────────
🌅 Fajr     : ${timings.Fajr}
☀️ Dhuhr    : ${timings.Dhuhr}
🌇 Asr      : ${timings.Asr}
🌆 Maghrib  : ${timings.Maghrib}
🌃 Isha     : ${timings.Isha}
──────────────────
🤲 Stay consistent with Salah`;

      return message.reply(msg);
    } catch (e) {
      return message.reply("❌ Failed to fetch prayer times.");
    }
  },

  onLoad: async function ({ api }) {
    if (!global.azanInterval) {
      global.azanInterval = setInterval(async () => {
        const currentTime = moment.tz("Asia/Dhaka").format("HH:mm");

        try {
          const res = await axios.get(
            "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2"
          );

          const timings = res.data.data.timings;

          const prayerNames = {
            Fajr: "Fajr",
            Dhuhr: "Dhuhr",
            Asr: "Asr",
            Maghrib: "Maghrib",
            Isha: "Isha"
          };

          for (const [key, value] of Object.entries(prayerNames)) {
            if (timings[key] === currentTime) {
              const allThreads = await api.getThreadList(100, null, ["INBOX"]);

              const msg =
`🔔 AZAN ALERT
──────────────────
🕌 It's time for ${value}
🤲 Go perform your prayer now
──────────────────`;

              allThreads.forEach((thread) => {
                api.sendMessage(msg, thread.threadID);
              });
            }
          }
        } catch (err) {
          console.log("Azan Error:", err);
        }
      }, 60000);
    }
  }
};
