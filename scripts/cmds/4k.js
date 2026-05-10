const axios = require("axios");

const getBase = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author Hasan
* DO NOT CHANGE AUTHOR
*/

module.exports = {
  config: {
    name: "4k",
    version: "2.0",
    author: "Hasan",
    countDown: 10,
    role: 0,
    category: "image",
    description: "Enhance image quality using AI 4K upscaler",
    guide: {
      en: "{pn} [image url] or reply to an image"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const startTime = Date.now();

    const imgUrl =
      event.messageReply?.attachments?.[0]?.type === "photo"
        ? event.messageReply.attachments[0].url
        : args.join(" ");

    if (!imgUrl) {
      return message.reply("⚠️ Please reply to an image or provide an image URL.");
    }

    const waitMsg = await message.reply("⏳ Processing your image into 4K quality... please wait 💖");
    message.reaction("✨", event.messageID);

    try {
      const apiUrl = `${await getBase()}/api/hd?imgUrl=${encodeURIComponent(imgUrl)}`;

      const res = await axios.get(apiUrl, { responseType: "stream" });

      if (waitMsg?.messageID) {
        await message.unsend(waitMsg.messageID);
      }

      const time = ((Date.now() - startTime) / 1000).toFixed(2);

      message.reaction("✅", event.messageID);

      return message.reply({
        body: `✨ Here is your enhanced 4K image\n⚡ Process Time: ${time}s`,
        attachment: res.data
      });

    } catch (err) {
      console.log(err);

      if (waitMsg?.messageID) {
        await message.unsend(waitMsg.messageID);
      }

      message.reaction("❌", event.messageID);
      return message.reply("❌ Sorry baby, image processing failed. Please try again later.");
    }
  }
};
