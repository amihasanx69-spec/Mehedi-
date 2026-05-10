const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tiksr"],
    version: "2.1.1",
    hasPermssion: 0,
    credits: "PremiumTool + Fixed",
    description: "Instant HD TikTok search and download",
    commandCategory: "media",
    usages: "[query or url]",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ").trim();
    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    if (!input) {
      return message.reply("📌 Please provide a TikTok name or video link.");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const fileName = `tik_${event.senderID}_${Date.now()}.mp4`;
    const videoPath = path.join(cacheDir, fileName);

    try {
      let endpoint = "https://www.tikwm.com/api/feed/search";
      let params = { keywords: input, count: 1, cursor: 0 };

      if (input.includes("tiktok.com")) {
        endpoint = "https://www.tikwm.com/api/";
        params = { url: input };
      }

      const res = await axios.get(endpoint, { params });

      const data = res?.data?.data;

      let video =
        Array.isArray(data)
          ? data[0]
          : data?.videos
          ? data.videos[0]
          : data;

      if (!video) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("❌ No video found.");
      }

      const finalUrl = video.hdplay || video.play || video.wmplay;

      if (!finalUrl) {
        return message.reply("❌ Video URL not available.");
      }

      const response = await axios({
        url: finalUrl,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: "🎀 Here is your TikTok video",
          attachment: fs.createReadStream(videoPath)
        });

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        fs.unlink(videoPath, () => {});
      });

      writer.on("error", async () => {
        api.setMessageReaction("⚠️", event.messageID, () => {}, true);
        return message.reply("❌ File write error occurred.");
      });

    } catch (error) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return message.reply("❌ Error fetching TikTok video.");
    }
  }
};
