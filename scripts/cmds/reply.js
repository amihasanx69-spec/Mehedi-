const fs = require("fs-extra");
const path = __dirname + "/cache/reply.json";

module.exports = {
  config: {
    name: "reply",
    version: "3.0",
    author: "Nazim",
    countDown: 0,
    role: 0,
    category: "fun",
    guide: {
      en: "{pn} add hi - hello\n{pn} del hi\n{pn} list"
    }
  },

  onStart: async function ({ args, message, event }) {

    const ownerUID = "61588972996269";

    if (event.senderID != ownerUID)
      return message.reply("❌ | Only bot owner can use this command.");

    if (!fs.existsSync(path))
      fs.writeJsonSync(path, {});

    const data = fs.readJsonSync(path);

    const action = args[0];

    // ADD
    if (action == "add") {

      const text = args.slice(1).join(" ");

      if (!text.includes(" - "))
        return message.reply("⚠️ Format:\n/reply add hi - hello");

      const split = text.split(" - ");

      const key = split[0]?.toLowerCase().trim();
      const value = split.slice(1).join(" - ").trim();

      if (!key || !value)
        return message.reply("⚠️ Invalid format.");

      data[key] = value;

      fs.writeJsonSync(path, data, { spaces: 2 });

      return message.reply(
`✅ 𝐑𝐞𝐩𝐥𝐲 𝐀𝐝𝐝𝐞𝐝

🔹 Trigger: ${key}
🔹 Reply: ${value}`
      );
    }

    // DELETE
    if (action == "del") {

      const key = args.slice(1).join(" ").toLowerCase().trim();

      if (!key)
        return message.reply("⚠️ Format:\n/reply del hi");

      if (!data[key])
        return message.reply("❌ Reply not found.");

      delete data[key];

      fs.writeJsonSync(path, data, { spaces: 2 });

      return message.reply(`✅ Deleted reply: ${key}`);
    }

    // LIST
    if (action == "list") {

      const keys = Object.keys(data);

      if (keys.length == 0)
        return message.reply("📭 No auto replies added.");

      let msg = "📜 𝐀𝐮𝐭𝐨 𝐑𝐞𝐩𝐥𝐲 𝐋𝐢𝐬𝐭\n\n";

      keys.forEach((item, index) => {
        msg += `${index + 1}. ${item}\n`;
      });

      return message.reply(msg);
    }

  },

  onChat: async function ({ event, message, api }) {

    if (!event.body) return;

    if (event.senderID == api.getCurrentUserID()) return;

    if (!fs.existsSync(path))
      fs.writeJsonSync(path, {});

    const data = fs.readJsonSync(path);

    const msg = event.body.toLowerCase().trim();

    for (const key in data) {

      if (msg == key) {
        return message.reply(data[key]);
      }

    }

  }
};
