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

// clean title
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
    author: "Hasan",
    version: "2.3-FIX",
    category: "fun",
    shortDescription: {
      en: "Play Lyric Video (Auto Delete Wait Msg)"
    }
  },

  onStart: async function ({ api, event, args }) {

    const emojis = ["🎶","🎧","🔥","✨","💿","⚡","🖤"];

    // 🔥 Waiting message (store ID)
    const waitMsg = await api.sendMessage(
`╭─🎶 LYRIC VIDEO
│ 🔎 Searching song...
│ ⏳ Please wait...
╰──────────────`,
      event.threadID
    );

    api.setMessageReaction(
      emojis[Math.floor(Math.random() * emojis.length)],
      event.messageID,
      () => {},
      true
    );

    try {
      let query = "";

      // 🎧 Reply system
      if (event.messageReply?.attachments?.length) {
        const att = event.messageReply.attachments[0];

        if (att.type === "audio" || att.type === "video") {

          const shortUrl = await shortenURL(att.url);

          const res = await axios.get(
            `https://audio-reco.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`
          );

          query = cleanTitle(res.data?.title || "");

        } else {
          api.unsendMessage(waitMsg.messageID);
          return api.sendMessage(
            "❌ Only reply to audio/video!",
            event.threadID,
            event.messageID
          );
        }
      }

      // 🎧 text search
      else if (args.length) {
        query = args.join(" ");
      }

      else {
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(
          "⚠️ Give a song name or reply to audio/video!",
          event.threadID,
          event.messageID
        );
      }

      if (!query) {
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(
          "❌ Song not detected!",
          event.threadID,
          event.messageID
        );
      }

      const finalQuery = `${cleanTitle(query)} lyrics video`;

      const videos = await fetchVideos(finalQuery);

      if (!videos || !videos.length) {
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(
          "❌ No lyric video found!",
          event.threadID,
          event.messageID
        );
      }

      const video = videos[0];

      if (!video?.videoUrl) {
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(
          "❌ Video not found!",
          event.threadID,
          event.messageID
        );
      }

      const stream = await getStreamFromURL(video.videoUrl);

      // 🔥 DELETE WAITING MESSAGE BEFORE SENDING VIDEO
      api.unsendMessage(waitMsg.messageID);

      return api.sendMessage(
        {
          body:
`╔══ 🎶 LYRIC VIDEO 🎶 ══╗
┃ 🎧 Song: ${query}
┃ ✨ Enjoy Music
┃ 👑 Powered by Hasan
╚════════════════════╝`,
          attachment: stream
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.log(err);

      api.unsendMessage(waitMsg.messageID);

      return api.sendMessage(
        "❌ Error fetching lyric video!",
        event.threadID,
        event.messageID
      );
    }
  }
};
