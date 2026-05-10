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
╔══════════════════════════╗
     🤖 𝗩𝗜𝗣 𝗕𝗢𝗧 𝗠𝗘𝗡𝗨
╚══════════════════════════╝
`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "other";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      for (const category of Object.keys(categories)) {
        msg += `\n╭━━━〔 ✦ ${category.toUpperCase()} ✦ 〕━━━╮`;

        categories[category].sort().forEach(cmd => {
          msg += `\n┃ ✧ ${cmd}`;
        });

        msg += `\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n`;
      }

      msg += `
╔══════════════════════════╗
┃ 📊 Total : ${commands.size}
┃ ⚡ Prefix : ${prefix}
┃ 👑 Owner  : Hasan
┃ 🚀 Status : ONLINE
╚══════════════════════════╝
`;

      // ================= GIF =================
      try {
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const filePath = path.join(cacheDir, `help_${Date.now()}.gif`);

        const res = await axios.get(
          "https://api.otakugifs.xyz/gif?reaction=punch",
          { timeout: 5000 }
        );

        const gifUrl = res?.data?.url;

        if (gifUrl) {
          const gif = await axios.get(gifUrl, {
            responseType: "arraybuffer",
            timeout: 10000
          });

          fs.writeFileSync(filePath, Buffer.from(gif.data));

          return message.reply({
            body: msg,
            attachment: fs.createReadStream(filePath)
          });
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
        return message.reply(`
╔════════════════╗
 ❌ COMMAND NOT FOUND
╚════════════════╝
"${cmdName}" নেই 😒
`);
      }

      const config = command.config;

      const usage =
        config.guide?.en?.replace(/{pn}/g, prefix) ||
        `${prefix}${config.name}`;

      const msg = `
╔══════════════════════════╗
        ⚙️ 𝗩𝗜𝗣 𝗖𝗠𝗗 𝗜𝗡𝗙𝗢
╚══════════════════════════╝

╭━━━〔 📛 COMMAND INFO 〕━━━╮
┃ ✦ Name     : ${config.name}
┃ ✦ Author   : ${config.author}
┃ ✦ Version  : ${config.version || "1.0"}
┃ ✦ Category  : ${config.category}
┃ ✦ Role     : ${config.role || 0}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 📖 USAGE 〕━━━╮
┃ ${usage}
╰━━━━━━━━━━━━━━━━━━━╯
`;

      return message.reply(msg);
    }
  }
};
