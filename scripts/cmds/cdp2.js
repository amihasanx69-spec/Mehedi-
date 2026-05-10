const axios = require("axios");

const baseApiUrl = async () => {
  try {
    const base = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json"
    );
    return base.data.mahmud;
  } catch (e) {
    return null;
  }
};

module.exports = {
  config: {
    name: "copuledp2",
    aliases: ["cdp2"],
    version: "2.0",
    author: "MahMUD + Hasan Fix",
    countDown: 8,
    role: 0,
    longDescription: "Fetch random stylish couple DP",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {

      const apiBase = await baseApiUrl();

      if (!apiBase)
        return message.reply("❌ API base পাওয়া যায়নি, পরে try করো!");

      const response = await axios.get(
        `${apiBase}/api/cdp2`,
        {
          headers: {
            author: module.exports.config.author
          }
        }
      );

      if (!response.data || response.data.error)
        return message.reply(
          "❌ Couple DP আনতে সমস্যা হচ্ছে, পরে try করো!"
        );

      const { male, female } = response.data;

      if (!male || !female)
        return message.reply(
          "❌ DP data পাওয়া যায়নি, পরে try করো!"
        );

      // 📸 image streams
      const maleImg = await global.utils.getStreamFromURL(male);
      const femaleImg = await global.utils.getStreamFromURL(female);

      // 💎 stylish message
      const msg = `
╔════════════════════╗
      💕 COUPLE DP 💕
╚════════════════════╝

👦 Male DP  ➜ Loaded
👧 Female DP ➜ Loaded

💖 Status: Ready for nibba-nibbi 😹
⚡ Type: Random Couple DP

╚════════════════════╝
`;

      await message.reply({
        body: msg,
        attachment: [maleImg, femaleImg]
      });

    } catch (error) {
      console.log("CDP Error:", error);
      return message.reply(
        "❌ Server error! পরে আবার try করো 😔"
      );
    }
  }
};
