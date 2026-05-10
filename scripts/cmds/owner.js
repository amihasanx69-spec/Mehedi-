const axios = require("axios");

module.exports = {
  config: {
    name: "owner",
    author: "Hasan + ChatGPT",
    role: 0,
    shortDescription: "Stylish Owner Info + Random Anime Edit Video",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {

      // 👤 OWNER INFO (Stylish)
      const owner = {
        name: "Mehedi Hasan",
        gender: "Male",
        birthday: "13/07/2008",
        religion: "Alhamdulillah Muslim ☪",
        hobby: "Gaming 🎮 + Editing",
        relationship: "Top Secret 🤫",
        vibe: "Silent Killer 😎"
      };

      // 🎥 Multiple API fallback system
      let videoUrl = null;

      const sources = [
        "https://www.tikwm.com/api/feed/search?keywords=anime%20edit",
        "https://www.tikwm.com/api/feed/search?keywords=anime%20status",
        "https://www.tikwm.com/api/feed/search?keywords=amv%20edit"
      ];

      for (let url of sources) {
        try {
          const res = await axios.get(url);

          const videos =
            res?.data?.data?.videos ||
            res?.data?.data ||
            [];

          if (Array.isArray(videos) && videos.length > 0) {
            const random =
              videos[Math.floor(Math.random() * videos.length)];

            videoUrl =
              random?.play ||
              random?.wmplay ||
              random?.url;

            if (videoUrl) break;
          }

        } catch (e) {
          continue;
        }
      }

      if (!videoUrl) {
        return api.sendMessage(
          "❌ ভিডিও লোড হচ্ছে না, পরে try করো 😢",
          event.threadID
        );
      }

      // 💎 Stylish UI Message
      const msg = `
╔══════════════════════╗
        🔥 OWNER INFO 🔥
╚══════════════════════╝

👤 Name      : ${owner.name}
⚧ Gender    : ${owner.gender}
🎂 Birthday  : ${owner.birthday}
☪ Religion   : ${owner.religion}
🎮 Hobby     : ${owner.hobby}
💖 Status    : ${owner.relationship}
😎 Vibe      : ${owner.vibe}

╔══════════════════════╗
   ⚡ Powered by Hasan Bot ⚡
╚══════════════════════╝
`;

      // 🥵 reaction
      api.setMessageReaction("🥵", event.messageID, () => {}, true);

      // 📩 send video + message
      await api.sendMessage(
        {
          body: msg,
          attachment: await global.utils.getStreamFromURL(videoUrl)
        },
        event.threadID,
        event.messageID
      );

    } catch (error) {
      console.log("Owner command error:", error);
      return api.sendMessage(
        "❌ কিছু error হয়েছে bro 😔",
        event.threadID
      );
    }
  },

  onChat: async function ({ api, event }) {
    if (event.body?.toLowerCase() === "owner") {
      this.onStart({ api, event });
    }
  }
};
