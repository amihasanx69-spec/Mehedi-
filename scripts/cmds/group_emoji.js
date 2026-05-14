module.exports = {
  config: {
    name: "emoji",
    version: "1.1.0",
    author: "Mohammad Akash",
    countDown: 0,
    role: 0,
    shortDescription: "Change group emoji 😘",
    longDescription: "Messenger গ্রুপের ইমোজি (Quick Reaction) পরিবর্তন করো মাত্র এক কমান্ডে!",
    category: "box chat",
    guide: "{pn} 😘"
  },

  onStart: async function ({ api, event, args }) {
    const emoji = args.join(" ");

    // ⚠️ যদি কোনো ইমোজি না দেয়
    if (!emoji) {
      return api.sendMessage("❌ | দয়া করে একটি ইমোজি দিন! উদাহরণ: /emoji 😘", event.threadID, event.messageID);
    }

    try {
      // ✅ গ্রুপ ইমোজি পরিবর্তন
      await api.changeThreadEmoji(emoji, event.threadID);
      return api.sendMessage(`✅ ${emoji}`, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      return api.sendMessage("⚠️ ", event.threadID, event.messageID);
    }
  }
};
