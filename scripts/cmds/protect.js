module.exports = {
  config: {
    name: "protect",
    version: "2.0",
    author: "MOHAMMAD AKASH + GPT",
    role: 1,
    shortDescription: "Ultra group protection system",
    category: "group",
    guide: "{pn} on/off"
  },

  onStart: async ({ api, event, message, threadsData, args }) => {
    const { threadID } = event;

    if (!args[0]) {
      return message.reply("⚠️ Use: /protect on OR /protect off");
    }

    if (args[0] === "on") {
      const info = await api.getThreadInfo(threadID);

      const protectData = {
        enable: true,
        name: info.threadName || "",
        emoji: info.emoji || "",
        color: info.color || "",
        nickname: {}
      };

      const members = info.participantIDs || [];
      for (const id of members) {
        protectData.nickname[id] = info.nicknames?.[id] || "";
      }

      await threadsData.set(threadID, protectData, "data.protect");

      return message.reply(
        "🛡️ 𝗛𝗔𝗥𝗗 𝗣𝗥𝗢𝗧𝗘𝗖𝗧 𝗢𝗡\n🔒 Group fully locked now!"
      );
    }

    if (args[0] === "off") {
      await threadsData.set(threadID, { enable: false }, "data.protect");
      return message.reply("🔓 Protection OFF");
    }
  },

  onEvent: async ({ api, event, threadsData }) => {
    const { threadID, logMessageType, logMessageData, author } = event;

    const data = await threadsData.get(threadID, "data.protect");
    if (!data?.enable) return;

    const info = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();

    const isBotAction = author === botID;

    // ❗ ANY CHANGE → INSTANT REVERT (EVEN ADMIN)
    
    try {
      // NAME LOCK
      if (logMessageType === "log:thread-name") {
        await api.setTitle(data.name, threadID);
      }

      // EMOJI LOCK
      if (logMessageType === "log:thread-icon") {
        await api.changeThreadEmoji(data.emoji, threadID);
      }

      // THEME LOCK
      if (logMessageType === "log:thread-color") {
        await api.changeThreadColor(data.color, threadID);
      }

      // NICKNAME LOCK
      if (logMessageType === "log:user-nickname") {
        const uid = logMessageData.participant_id;

        await api.changeNickname(
          data.nickname?.[uid] || "",
          threadID,
          uid
        );
      }

    } catch (e) {
      console.log("Protect error:", e);
    }

    // 🔄 AUTO UPDATE IF BOT DOES CHANGE
    if (isBotAction) {
      const updated = await api.getThreadInfo(threadID);

      await threadsData.set(threadID, {
        ...data,
        name: updated.threadName || data.name,
        emoji: updated.emoji || data.emoji,
        color: updated.color || data.color
      }, "data.protect");
    }
  }
};
