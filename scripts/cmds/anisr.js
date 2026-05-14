const axios = require('axios');
const { ShAntikSearch } = require('shan-server'); 

module.exports = {
  config: {
    name: "anisearch",
    aliases: ["anisrc", "anisar"],
    author: "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
    version: "1.0",
    shortDescription: {
      en: "get anime edit",
    },
    longDescription: {
      en: "search for anime edits video",
    },
    category: "media",
    usePrefix: false, 
    guide: {
      en: "{p}{n} [query]",
    },
  },
  
  onStart: async function ({ api, event, args }) {
     api.setMessageReaction("✨", event.messageID, (err) => {}, true);
    const query = args.join(' ');
    const modifiedQuery = `${query} anime edit`;

    const videos = await ShAntikSearch(modifiedQuery, this.config.author);

    if (!videos || videos.length === 0) {
      return api.sendMessage(`${query} not found.`, event.threadID, event.messageID);
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.ShAn;

    if (!videoUrl) {
      return api.sendMessage('Error: Video not found.', event.threadID, event.messageID);
    }

    try {
      const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

      await api.sendMessage({
        body: ``,
        attachment: videoStream.data,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage('An error occurred while processing the video.\nPlease try again later.', event.threadID, event.messageID);
    }
  }
};
