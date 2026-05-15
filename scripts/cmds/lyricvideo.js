const axios = require("axios");
const { getStreamFromURL, shortenURL } = global.utils;

async function fetchVideos(query) {
  try {
    const res = await axios.get(
      `https://lyric-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent(query)}`
    );
    return res.data;
  } catch (e) {
    return null;
  }
}

// 🎶 Clean Song Title
function cleanTitle(text = "") {
  return text
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/official|video|lyrics|audio/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  config: {
    name: "lyricvideo",
    aliases: ["lv"],
    author: "Hasan + ChatGPT",
    version: "3.1",
    category: "fun",
    shortDescription: {
      en: "Play lyric video"
    }
  },

  onStart: async function ({ api, event, args }) {

    const reacts = ["🎶","🎧","⚡","✨","💿"];

    // ✨ Stylish Small Wait Msg
    const waitMsg = await api.sendMessage(
`🎧 𝐋𝐲𝐫𝐢𝐜 𝐕𝐢𝐛𝐞𝐬...
⚡ 𝐋𝐢𝐯𝐞 𝐋𝐨𝐚𝐝𝐢𝐧𝐠
✨ 𝐉𝐮𝐬𝐭 𝐖𝐚𝐢𝐭`,
      event.threadID
    );

    api.setMessageReaction(
      reacts[Math.floor(Math.random() * reacts.length)],
      event.messageID,
      () => {},
      true
    );

    try {

      let query = "";

      // 🎵 Reply Audio/Video
      if (event.messageReply?.attachments?.length) {

        const att = event.messageReply.attachments[0];

        if (att.type === "audio" || att.type === "video") {

          const shortUrl = await shortenURL(att.url);

          const res = await axios.get(
            `https://audio-reco.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`
          );

          query = cleanTitle(res.data?.title || "");

        } else {

          if (waitMsg?.messageID)
            api.unsendMessage(waitMsg.messageID);

          return api.sendMessage(
            "❌ Reply only to audio or video.",
            event.threadID,
            event.messageID
          );
        }
      }

      // 🔎 Search by text
      else if (args.length) {
        query = args.join(" ");
      }

      else {

        if (waitMsg?.messageID)
          api.unsendMessage(waitMsg.messageID);

        return api.sendMessage(
          "⚠️ Enter song name or reply to audio/video.",
          event.threadID,
          event.messageID
        );
      }

      // ❌ Empty Query
      if (!query) {

        if (waitMsg?.messageID)
          api.unsendMessage(waitMsg.messageID);

        return api.sendMessage(
          "❌ Song not detected.",
          event.threadID,
          event.messageID
        );
      }

      const finalQuery = `${cleanTitle(query)} lyrics video`;

      const videos = await fetchVideos(finalQuery);

      // ❌ No Results
      if (!videos || !videos.length) {

        if (waitMsg?.messageID)
          api.unsendMessage(waitMsg.messageID);

        return api.sendMessage(
          "❌ No lyric video found.",
          event.threadID,
          event.messageID
        );
      }

      const video = videos[0];

      // ❌ Invalid URL
      if (!video?.videoUrl) {

        if (waitMsg?.messageID)
          api.unsendMessage(waitMsg.messageID);

        return api.sendMessage(
          "❌ Video URL missing.",
          event.threadID,
          event.messageID
        );
      }

      // 📥 Download Stream
      const stream = await getStreamFromURL(video.videoUrl);

      // 🗑️ Remove Wait Msg
      if (waitMsg?.messageID)
        api.unsendMessage(waitMsg.messageID);

      // 🎶 Final Send
      return api.sendMessage(
        {
          body:
`🎶 𝐋𝐘𝐑𝐈𝐂 𝐕𝐈𝐃𝐄𝐎

🎧 ${query}
✨ Enjoy Your Music`,
          attachment: stream
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {

      console.log(err);

      if (waitMsg?.messageID)
        api.unsendMessage(waitMsg.messageID);

      return api.sendMessage(
        "❌ Error fetching lyric video.",
        event.threadID,
        event.messageID
      );
    }
  }
};
