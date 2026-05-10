const axios = require("axios");
const { getStreamFromURL, shortenURL } = global.utils;

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "lyricvideo",
    aliases: ["lv"],
    author: "Hasan",
    version: "2.1",
    shortDescription: {
      en: "Play Lyric Video (Short + Long)"
    },
    longDescription: {
      en: "Search & Send Beautiful Lyric Video"
    },
    category: "fun",
    guide: {
      en: "{p}{n} [song name] or reply to audio/video"
    }
  },

  onStart: async function ({ api, event, args }) {

    const emojiReact = [
      "🎧","🎶","🎵","✨","💫","🔥",
      "📀","🎤","🖤","🌈","⚡","💥",
      "📹","🎬","🫶","🥀","🎼","🎹",
      "🎻","🎷","🪩","🌟","🔊","🎚️",
      "🎛️","📻","🎙️","💿","🌀","🌌",
      "🕊️","💎","🌠","🎇","🎆","🧿"
    ];

    api.setMessageReaction(
      emojiReact[Math.floor(Math.random() * emojiReact.length)],
      event.messageID,
      () => {},
      true
    );

    try {

      let query = "";

      // ===== Waiting Message =====
      const waitingMessages = [
`╭─❍ 🎶 𝗟𝘆𝗿𝗶𝗰 𝗩𝗶𝗱𝗲𝗼 𝗦𝘆𝘀𝘁𝗲𝗺
├ ✨ Searching Beautiful Video...
├ 🎧 Please Wait A Moment
╰───────────────⍟`,

`╔═══ 🎵 𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 🎵 ═══╗
┃ 🔎 Finding Best Lyric Video
┃ 📀 Loading Music Experience...
┃ ⚡ Almost Ready
╚═══════════════════════╝`,

`🌌 Connecting To Music Server...
🎶 Collecting HD Lyric Video
✨ Please Wait...`
      ];

      api.sendMessage(
        waitingMessages[Math.floor(Math.random() * waitingMessages.length)],
        event.threadID
      );

      // ===== Reply to audio/video =====
      if (event.messageReply && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];

        if (attachment.type === "video" || attachment.type === "audio") {

          const shortUrl = await shortenURL(attachment.url);

          const musicRecognition = await axios.get(
            `https://audio-reco.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`
          );

          query = musicRecognition.data.title;

        } else {
          return api.sendMessage(
            "❌ Reply only to audio or video.",
            event.threadID,
            event.messageID
          );
        }
      }

      // ===== Text search =====
      else if (args.length > 0) {
        query = args.join(" ");
      }

      else {
        return api.sendMessage(
          "⚠️ Please provide a song name or reply to an audio/video.",
          event.threadID,
          event.messageID
        );
      }

      const finalQuery = `${query} lyrics video edit`;
      const videos = await fetchTikTokVideos(finalQuery);

      if (!videos || videos.length === 0) {
        return api.sendMessage(
          `❌ No lyric video found for: ${query}`,
          event.threadID,
          event.messageID
        );
      }

      const selectedVideo =
        videos[Math.floor(Math.random() * videos.length)];

      const videoUrl = selectedVideo.videoUrl;

      if (!videoUrl) {
        return api.sendMessage(
          "❌ Video not found!",
          event.threadID,
          event.messageID
        );
      }

      const videoStream = await getStreamFromURL(videoUrl);

      api.sendMessage(
        {
          body:
`╔═══ 🎶 𝗟𝗬𝗥𝗜𝗖 𝗩𝗜𝗗𝗘𝗢 🎶 ═══╗
┃
┃ ✨ Now Playing: ${query}
┃ 📀 Enjoy The Music...
┃ 🎧 Ultra HD Lyric Experience
┃
┃ 👑 Author: Hasan
┃ 
┃
╚═══════════════════════╝`,
          attachment: videoStream
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.log(e);
      api.sendMessage(
        "❌ Error while fetching lyric video!\nTry again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
