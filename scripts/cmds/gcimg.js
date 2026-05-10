const axios = require("axios");

let cachedBaseApi = null;

// cache base api (fast boost)
const baseApiUrl = async () => {
  if (cachedBaseApi) return cachedBaseApi;

  const base = await axios.get(
    "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json"
  );

  cachedBaseApi = base.data.api;
  return cachedBaseApi;
};

// FAST parallel avatar fetch
async function getAvatarUrls(userIDs) {
  return Promise.all(
    userIDs.map(async (userID) => {
      try {
        const res = await axios.get(
          `https://graph.facebook.com/${userID}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );
        return res.request.res.responseUrl;
      } catch (err) {
        return "https://i.ibb.co/qk0bnY8/363492156-824459359287620-3125820102191295474-n-png-nc-cat-1-ccb-1-7-nc-sid-5f2048-nc-eui2-Ae-HIhi-I.png";
      }
    })
  );
}

module.exports = {
  config: {
    name: "gcimg",
    aliases: ["gcimage", "grpimage"],
    version: "2.0",
    author: "nexo_here + fixed",
    countDown: 3,
    role: 0,
    description: "Fast group image generator",
    category: "image",
    guide: "{pn} [--color white] [--bgcolor black]"
  },

  onStart: async function ({ api, args, event, message }) {
    try {
      let textColor = "white";
      let bgColor = null;
      let adminColor = "yellow";
      let memberColor = "cyan";
      let borderColor = "lime";
      let glow = false;

      for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
          case "--color": textColor = args[i + 1]; i++; break;
          case "--bgcolor": bgColor = args[i + 1]; i++; break;
          case "--admincolor": adminColor = args[i + 1]; i++; break;
          case "--membercolor": memberColor = args[i + 1]; i++; break;
          case "--groupBorder": borderColor = args[i + 1]; i++; break;
          case "--glow": glow = args[i + 1]?.toLowerCase() === "true"; i++; break;
        }
      }

      const threadInfo = await api.getThreadInfo(event.threadID);

      // ⚡ FAST parallel fetch
      const [memberAvatars, adminAvatars] = await Promise.all([
        getAvatarUrls(threadInfo.participantIDs),
        getAvatarUrls(threadInfo.adminIDs.map(a => a.id))
      ]);

      const payload = {
        groupName: threadInfo.threadName,
        groupPhotoURL: threadInfo.imageSrc,
        memberURLs: memberAvatars,
        adminURLs: adminAvatars,
        color: textColor,
        bgcolor: bgColor,
        admincolor: adminColor,
        membercolor: memberColor,
        groupborderColor: borderColor,
        glow
      };

      // 🔥 faster waiting message (short + clean)
      const waitMsg = await message.reply("⏳ Generating group image...");

      api.setMessageReaction("⚡", event.messageID, () => {}, true);

      const response = await axios.post(
        `${await baseApiUrl()}/gcimg`,
        payload,
        { responseType: "stream" }
      );

      message.unsend(waitMsg.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      return message.reply({
        body: "✨ Group image ready!",
        attachment: response.data
      });

    } catch (err) {
      console.error("[gcimg] Error:", err);
      return message.reply("❌ Failed to generate group image.");
    }
  }
};
