const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "edit",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "image",
    guide: { en: "{p}edit [prompt] reply to image" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply(
        "📌 Please reply to an image and provide an edit prompt.\nExample: /edit change background to night"
      );
    }

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);

    const imgPath = path.join(cacheDir, `${Date.now()}_edit.jpg`);

    const waitMsg = await message.reply(
      "⏳ Editing your image...\nPlease wait a moment 🪄"
    );

    try {
      const baseURL = await mahmud();

      const res = await axios.post(
        `${baseURL}/api/edit`,
        {
          prompt: prompt,
          imageUrl: repliedImage.url
        },
        { responseType: "arraybuffer" }
      );

      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body: `✅ Image edited successfully!\n📝 Prompt: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Sorry, something went wrong. Please try again later.");
    } finally {
      setTimeout(() => fs.remove(imgPath).catch(() => {}), 10000);
      if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
    }
  }
};
