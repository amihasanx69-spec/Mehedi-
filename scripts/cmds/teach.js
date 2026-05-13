const Teach = require("../../database/models/mongodb/Teach");

global.teachStatus = global.teachStatus || {};

module.exports = {
  config: {
    name: "teach",
    version: "5.0.0",
    author: "Asraful",
    role: 2,
    countDown: 3,
    category: "ai"
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID } = event;

    // ON
    if (args[0] === "on") {
      global.teachStatus[threadID] = true;
      return message.reply("✅ Teach ON");
    }

    // OFF
    if (args[0] === "off") {
      global.teachStatus[threadID] = false;
      return message.reply("❌ Teach OFF");
    }

    // LIST
    if (args[0] === "list") {
      const list = await Teach.find({ threadID });

      if (!list.length)
        return message.reply("❌ No teach found");

      let msg = "📚 TEACH LIST\n━━━━━━━━━━━━━━";

      list.forEach((item, i) => {
        msg += `\n${i + 1}. ${item.trigger} → ${item.response}`;
      });

      return message.reply(msg);
    }

    // DELETE
    if (args[0] === "delete") {
      const key = args.slice(1).join(" ").toLowerCase();

      if (!key)
        return message.reply("⚠ Example: .teach delete hi");

      const deleted = await Teach.deleteOne({
        threadID,
        trigger: key
      });

      if (deleted.deletedCount === 0)
        return message.reply("❌ Not found");

      return message.reply(`🗑 Deleted: ${key}`);
    }

    // TOTAL
    if (args[0] === "total") {
      const total = await Teach.countDocuments({ threadID });
      return message.reply(`📚 Total: ${total}`);
    }

    // ADD / UPDATE
    const text = args.join(" ");
    if (!text.includes("-"))
      return message.reply("⚠ Example: .teach hi-hlw");

    const [trigger, ...res] = text.split("-");
    const response = res.join("-");

    await Teach.findOneAndUpdate(
      { threadID, trigger: trigger.trim().toLowerCase() },
      {
        threadID,
        trigger: trigger.trim().toLowerCase(),
        response,
        author: event.senderID
      },
      { upsert: true }
    );

    return message.reply(`✅ Learned: ${trigger}`);
  },

  // SMART + FUZZY MATCH
  onChat: async function ({ event, api }) {
    const { threadID, body, senderID } = event;

    if (!body) return;
    if (senderID === api.getCurrentUserID()) return;

    if (global.teachStatus[threadID] === false) return;

    const msg = body.toLowerCase();

    const data = await Teach.find({ threadID });

    for (const item of data) {
      const trigger = item.trigger.toLowerCase();

      // 🔥 SMART MATCHING
      if (
        msg === trigger ||                 // exact
        msg.includes(trigger) ||           // contains
        trigger.includes(msg)              // reverse match (close word)
      ) {
        return api.sendMessage(item.response, threadID);
      }
    }
  }
};
