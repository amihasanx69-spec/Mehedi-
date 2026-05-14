const axios = require("axios");
const mahmud = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "cdpvip",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "media",
    guide: "{p}cdpvip <category>\n{p}cdpvip list"
  },

  onStart: async function ({ message, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    if (!args.length)
      return message.reply("⚠ Usage:\n!cdpvip <category>\n!cdpvip list");

    const command = args[0].toLowerCase();

    try {
      const apiBase = await mahmud();
      const baseUrl = `${apiBase}/api/cdpvip2`;
      
      const getStream = async (url) => {
        const res = await axios({
          url,
          method: "GET",
          responseType: "stream",
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        return res.data;
      };

      if (command === "list") {
        const res = await axios.get(`${baseUrl}/list`);
        const summary = res.data?.summary || {};

        if (!Object.keys(summary).length)
          return message.reply("⚠ No categories found.");

        let msg = "🎀 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬:\n";
        for (const [cat, count] of Object.entries(summary)) {
          msg += `- ${cat}`;
        }
        return message.reply(msg);
      }

      const listRes = await axios.get(`${baseUrl}/list`);
      const availableCategories = Object.keys(listRes.data?.summary || {});

      if (!availableCategories.includes(command)) {
        let msg = `🥹 Category not found. Available categories:\n`;
        availableCategories.forEach((cat) => (msg += `- ${cat}\n`));
        return message.reply(msg);
      }

      const res = await axios.get(`${baseUrl}?category=${command}`);
      const groupImages = res.data?.group || [];

      if (!groupImages.length)
        return message.reply(`⚠ No DP found in "${command}" category.`);

      const streamAttachments = [];
      for (const url of groupImages) {
        try {
          const stream = await getStream(url);
          streamAttachments.push(stream);
        } catch {
          console.warn(`⚠ Failed to load image: ${url}`);
        }
      }

      if (!streamAttachments.length)
        return message.reply("❌ All image URLs failed to load.");

      return message.reply({
        body: `𝐏𝐢𝐰 𝐏𝐢𝐰 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐚𝐧𝐝𝐨𝐦 ${command} 𝐜𝐝𝐩 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲 <😘`,
        attachment: streamAttachments
      });

    } catch (err) {
      console.error("Full error:", err.response?.data || err.message);
      return message.reply("🥹error, contact Gojo Orupe Piw Piw");
    }
  }
};
