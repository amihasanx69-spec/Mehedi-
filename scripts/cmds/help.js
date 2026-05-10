const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "5.0",
    author: "Hasan X Fix + ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage" },
    longDescription: { en: "View all commands and command details" },
    category: "info",
    guide: { en: "{pn}help / {pn}help cmdName" },
    priority: 1,
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);

    // ================= ALL COMMAND =================
    if (!args.length) {
      const categories = {};
      let msg = `
╔══════════════════════╗
      🤖 𝗕𝗢𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦
╚══════════════════════╝
`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "other";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      for (const category of Object.keys(categories)) {
        msg += `\n╭───〔 ${category.toUpperCase()} 〕───╮`;

        categories[category].sort().forEach(cmd => {
          msg += `\n│ ✦ ${cmd}`;
        });

        msg += `\n╰────────────────╯\n`;
      }

      msg += `
╔══════════════════════╗
┃ 📊 Total Commands: ${commands.size}
┃ ⚡ Prefix: ${prefix}
┃ 👑 Owner: Hasan
┃ 🚀 Status: Online
╚══════════════════════╝
`;

      // ================= ANIME GIF =================
      try {
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const filePath = path.join(cacheDir, `help_${Date.now()}.gif`);

        // Anime GIF API
        const res = await axios.get(
          "https://api.otakugifs.xyz/gif?reaction=punch",
          {
            timeout: 5000
          }
        );

        const gifUrl = res?.data?.url;

        if (gifUrl) {
          const gif = await axios.get(gifUrl, {
            responseType: "arraybuffer",
            timeout: 10000
          });

          fs.writeFileSync(filePath, Buffer.from(gif.data));

          await message.reply({
            body: msg,
            attachment: fs.createReadStream(filePath)
          });

          setTimeout(() => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }, 5000);

          return;
        }
      } catch (e) {
        console.log("GIF Error:", e.message);
      }

      return message.reply(msg);
    }

    // ================= SINGLE COMMAND =================
    else {
      const cmdName = args[0].toLowerCase();
      const command =
        commands.get(cmdName) ||
        commands.get(aliases.get(cmdName));

      if (!command) {
        return message.reply(`❌ Command "${cmdName}" not found`);
      }

      const config = command.config;

      const usage =
        config.guide?.en?.replace(/{pn}/g, prefix) ||
        `${prefix}${config.name}`;

      const msg = `
╔══════════════════════╗
        ⚙️ COMMAND INFO
╚══════════════════════╝
┃ 📛 Name: ${config.name}
┃ 👑 Author: ${config.author}
┃ 📦 Version: ${config.version || "1.0"}
┃ 🔰 Role: ${config.role || 0}
┃ 📂 Category: ${config.category}
┣━━━━━━━━━━━━━━━━━━━━━━
┃ 📖 Usage:
┃ ${usage}
╚━━━━━━━━━━━━━━━━━━━━━━╝
`;

      return message.reply(msg);
    }
  }
};
