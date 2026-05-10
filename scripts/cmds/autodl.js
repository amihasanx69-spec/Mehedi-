const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

function detectPlatform(url) {
  if (url.includes("facebook")) return "FACEBOOK";
  if (url.includes("tiktok")) return "TIKTOK";
  if (url.includes("youtube") || url.includes("youtu.be")) return "YOUTUBE";
  if (url.includes("instagram")) return "INSTAGRAM";
  return "UNKNOWN";
}

module.exports = {
  config: {
    name: "autodl",
    version: "1.3",
    author: "Hasan",
    category: "media"
  },

  onChat: async function ({ api, event }) {
    try {
      if (!event.body) return;

      const match = event.body.match(/(https?:\/\/[^\s]+)/g);
      if (!match) return;

      const link = match[0];
      const platform = detectPlatform(link);

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      const base = await baseApiUrl();
      const apiUrl = `${base}/api/download/video?link=${encodeURIComponent(link)}`;

      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const buffer = Buffer.from(res.data);
      if (!buffer || buffer.length < 1000) return;

      fs.writeFileSync(filePath, buffer);

      api.setMessageReaction("🔥", event.messageID, () => {}, true);

      return api.sendMessage(
        {
          body: `⚡ ${platform} • DOWNLOAD READY`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      );

    } catch (err) {
      console.log("AutoDL Error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
