const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const cron = require('node-cron');

const filePath = path.join(__dirname, 'cache', 'tcp_data.json');
const ADMIN_ID = "61588972996269";

module.exports = {
  config: {
    name: "tcp",
    version: "1.3",
    author: "Hasan",
    role: 1,
    shortDescription: { en: "Auto love captions with custom list" },
    category: "automation",
    guide: { en: "{pn} add | {pn} remove | {pn} list" }
  },

  onLoad: async function ({ api }) {
    if (!fs.existsSync(filePath)) {
      fs.ensureDirSync(path.join(__dirname, 'cache'));
      fs.writeJsonSync(filePath, { activeGroups: [] });
    }

    cron.schedule('0 * * * *', async () => {
      const data = fs.readJsonSync(filePath);
      const activeGroups = data.activeGroups;
      if (!activeGroups.length) return;

      const captions = [
        "গল্পটা তখনই ভালো ছিলো 😊🌸\nযখন তুমি ছিলে অপরিচিত আর আমি ছিলাম আমার আমিতে সীমাবদ্ধ༄༎•🙂🖤🦋",
        "হয়তো তুমি আমার ভাগ্যেই ছিলে না, 🥀✨\nতাই তো এতোটা ভালোবেসেও তোমাকে পেলাম না! ༄༎•🙂🖤🦋",
        "প্রিয়জন মানেই তো মায়ার বাঁধন, 💞💫\nযা সহজে ভোলা যায় না কোনোদিনও! ༄༎•🙂🖤🦋",
        "ভালোবেসে আগলে রাখার নামই হলো বন্ধুত্ব, 🕊️💖\nআর সেই বন্ধু যদি হয় জীবনসঙ্গী, তবেই পূর্ণতা! ༄༎•🙂🖤🦋",
        "অভিমান তো তারাই করে যারা বেশি ভালোবাসে, ✨🎈\nআর সহ্য তারাই করে যারা মায়ার টানে আটকে থাকে! ༄༎•🙂🖤🦋",
        "কাউকে খুব বেশি মায়ায় জড়িয়ে ফেলাটা এক ধরণের অপরাধ, 🥀\nকারণ সেই মানুষটা চলে গেলে জীবনটা স্থবির হয়ে পড়ে! ༄༎•🙂🖤🦋",
        "খুব সাধারণ আমি, আর অসাধারণ আমার ভালোবাসা 💫\nজেনো শুধু তোমাকেই চায় আমার এই মন! ༄༎•🙂🖤🦋",
        "যে মানুষটা তোমাকে হারানোর ভয়ে কাঁদে, 😢\nজেনো সে তোমাকে সবচেয়ে বেশি ভালোবাসে! ༄༎•🙂🖤🦋",
        "ইচ্ছেগুলো সব তোমায় ঘিরে, ডানা মেলে ওড়ে অবুঝ মনে 🕊️\nসারাক্ষণ শুধু তোমায় দেখার নেশা জাগে! ༄༎•🙂🖤🦋",
        "স্মৃতিগুলো আজও অমলিন, শুধু মানুষটা বদলে গেছে সময়ের টানে! ⏳🍂 ༄༎•🙂🖤🦋",
        "মাঝে মাঝে মনে হয় তুমি আমার সব, আবার পরক্ষণেই মনে হয় তুমি আমার কিছুই নও! 💔 ༄༎•🙂🖤🦋",
        "ভালোবাসা মানে শুধু হাত ধরা নয়, ভালোবাসা মানে বিপদেও পাশে থাকা! 🤝💞 ༄༎•🙂🖤🦋",
        "একটু হাসি, একটু কথা, আর অনেকগুলো স্বপ্ন ✨\nসবটুকুই শুধু তোমায় নিয়ে সাজানো! ༄༎•🙂🖤🦋",
        "তুমি আমার সেই সুন্দর কবিতা, যা আমি প্রতিদিন নতুন করে পড়তে চাই! 📖💖 ༄༎•🙂🖤🦋",
        "দূরত্ব কখনো ভালোবাসা কমায় না, বরং মনের টান আরও বাড়িয়ে দেয়! 🛤️💞 ༄༎•🙂🖤🦋",
        "অভিমানী এই মন শুধু তোমার একটুখানি মায়া চায়! 🥺🌸 ༄༎•🙂🖤🦋",
        "হাজারো মানুষের ভিড়েও আমি শুধু তোমার চোখ দুটোই খুঁজি! 👀✨ ༄༎•🙂🖤🦋",
        "রাতের ওই চাঁদের মতো তুমিও আমার অন্ধকার জীবনের আলো! 🌕💖 ༄༎•🙂🖤🦋",
        "তুমি হীনা প্রতিটি মুহূর্ত যেন এক একটা যুগের সমান! ⏳🥀 ༄༎•🙂🖤🦋",
        "হয়তো কোনো এক বিকেলে আবার দেখা হবে আমাদের সেই চেনা পথে! 🌇🚶‍♂️ ༄༎•🙂🖤🦋",
        "তোমার চোখের ভাষায় আমি নিজেকে হারিয়ে ফেলি! 👁️💞 ༄༎•🙂🖤🦋",
        "ভালোবাসা হলো সেই অনুভূতি যা হৃদয়ে গভীরে গেঁথে থাকে! 💓✨ ༄༎•🙂🖤🦋",
        "তুমি পাশে থাকলে পৃথিবীটা যেন স্বর্গ মনে হয়! 🌍🕊️ ༄༎•🙂🖤🦋",
        "অভিমান বেশিদিন থাকে না, ভালোবাসাটাই শেষ পর্যন্ত জেতে! 💘🦋 ༄༎•🙂🖤🦋",
        "তুমি আমার কাছে সেই আকাশের মতো, যার শেষ নেই! 🌌💖 ༄༎•🙂🖤🦋",
        "আমাদের গল্পটা হয়তো অসম্পূর্ণ, কিন্তু অনুভূতিগুলো চিরন্তন! ✍️🍂 ༄༎•🙂🖤🦋",
        "তোমার হাসিতেই আমার দিনের শুরু আর শেষ! 😊🌅 ༄༎•🙂🖤🦋",
        "ভালোবাসার কোনো নির্দিষ্ট ভাষা নেই, শুধু হৃদয়ের টানই যথেষ্ট! 💟✨ ༄༎•🙂🖤🦋",
        "কিছু কথা না বলাই ভালো, চোখের ভাষাই সব বলে দেয়! 😶👀 ༄༎•🙂🖤🦋",
        "তুমি ছাড়া আমার প্রতিটি সেকেন্ড বড্ড একা! ⏳🥀 ༄༎•🙂🖤🦋",
        "মায়া বড় কঠিন এক জিনিস, সহজে কাটে না! ⛓️💞 ༄༎•🙂🖤🦋",
        "হয়তো এটাই ভালোবাসা, যখন তুমি শুধু তার সুখেই সুখী! 😊✨ ༄༎•🙂🖤🦋",
        "স্মৃতির পাতায় আজও তুমি ধ্রুবতারার মতো উজ্জ্বল! 🌟💖 ༄༎•🙂🖤🦋",
        "তুমি আমার সেই সকালের প্রথম আলো! ☀️🕊️ ༄༎•🙂🖤🦋",
        "এক মুঠো ভালোবাসা তোমাকে দিলাম, আগলে রেখো! 🎁💞 ༄༎•🙂🖤🦋",
        "স্বপ্ন দেখাও অপরাধ নয়, যদি সেটা তোমায় কেন্দ্র করে হয়! 🌙💫 ༄༎•🙂🖤🦋",
        "তোমার জন্য আজও আমার মন অস্থির হয়ে ওঠে! 💓🌿 ༄༎•🙂🖤🦋",
        "ভালোবাসা মানে একে অপরের পরিপূরক হওয়া! 💑✨ ༄༎•🙂🖤🦋",
        "কিছু মানুষ হৃদয়ে চিরস্থায়ী জায়গা করে নেয়! 🔑❤️ ༄༎•🙂🖤🦋",
        "তুমি আমার সেই অগোছালো জীবনের সুন্দর গুছানো অংশ! 🧩💖 ༄༎•🙂🖤🦋",
        "অভিমানগুলো সব জমা থাক, ভালোবাসার দিনে সব ধুয়ে যাবে! 🌧️💗 ༄༎•🙂🖤🦋",
        "তুমি আমার সেই শান্ত নদীর তীর! 🌊💞 ༄༎•🙂🖤🦋",
        "স্মৃতির ভিড়ে আজও তোমায় খুঁজি! 🧐🍂 ༄༎•🙂🖤🦋",
        "ভালোবাসা তো একদিনের নয়, সারাজীবনের অঙ্গীকার! 💍✨ ༄༎•🙂🖤🦋",
        "তোমার ওই দুষ্টু হাসিটাই আমার সব দুর্বলতা! 😈💖 ༄༎•🙂🖤🦋",
        "তুমি হীনা পৃথিবীটা যেন বর্ণহীন! 🎨🥀 ༄༎•🙂🖤🦋",
        "তোমার প্রতিটি কথায় আমার মনের শান্তি! 🗣️💫 ༄༎•🙂🖤🦋",
        "তুমি আমার সেই প্রিয় গান, যা বারবার শুনি! 🎶🖤 ༄༎•🙂🖤🦋",
        "স্বপ্ন দেখি তোমায় নিয়ে, বাস্তবতা দেখি তোমায় ছাড়া! 🌃💔 ༄༎•🙂🖤🦋",
        "তুমি আমার বিশ্বাসের সবচেয়ে নিরাপদ আশ্রয়! 🏠💖 ༄༎•🙂🖤🦋",
        "ভালোবাসা কখনো মরে না, শুধু রূপ বদলায়! 🦋✨ ༄༎•🙂🖤🦋",
        "একটু সময় দাও, ভালোবাসাটা বুঝতে শিখবে! ⏳💞 ༄༎•🙂🖤🦋",
        "তোমার অস্তিত্বই আমার বেঁচে থাকার কারণ! 🍃💖 ༄༎•🙂🖤🦋",
        "অভিমানের আড়ালে লুকিয়ে থাকে অনেক ভালোবাসা! 🤫❤️ ༄༎•🙂🖤🦋",
        "তুমি আমার সেই হারিয়ে যাওয়া গল্প! 📖🥀 ༄༎•🙂🖤🦋",
        "ভালোবাসার মানুষটার একটু হাসিই যথেষ্ট! 😊✨ ༄༎•🙂🖤🦋",
        "তুমি আমার সেই নীল আকাশের মেঘ! ☁️💙 ༄༎•🙂🖤🦋",
        "সব গল্প শেষ হয় না, কিছু গল্প হৃদয়ে বেঁচে থাকে! 💌🖤 ༄༎•🙂🖤🦋",
        "তোমার হাতটা ধরে সারাজীবন চলতে চাই! 🤝💫 ༄༎•🙂🖤🦋",
        "তুমিই আমার সবটুকু ভালোবাসা, সবটুকু আবেগ! 💖🔥 ༄༎•🙂🖤🦋"
      ];

      const time = moment.tz("Asia/Dhaka").format("hh:mm A");
      const randomCaption = captions[Math.floor(Math.random() * captions.length)];

      const message =
`•—»🩷 TIME "${time}" 🩷«—•

✢━━━━━━━━━━━━━━━✢

${randomCaption}

✢━━━━━━━━━━━━━━━✢`;

      for (const threadID of activeGroups) {
        api.sendMessage(message, threadID).catch(() => {});
      }
    }, { scheduled: true, timezone: "Asia/Dhaka" });
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, senderID, messageID } = event;
    const data = fs.readJsonSync(filePath);

    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin =
      threadInfo.adminIDs.some(i => i.id === senderID) ||
      senderID === ADMIN_ID;

    if (!isAdmin)
      return api.sendMessage("🚫 Only admins can use this command!", threadID, messageID);

    const action = args[0] ? args[0].toLowerCase() : "";

    if (action === "add") {
      if (data.activeGroups.includes(threadID))
        return api.sendMessage("⚠️ Already active!", threadID, messageID);

      data.activeGroups.push(threadID);
      fs.writeJsonSync(filePath, data);
      return api.sendMessage("✅ Enabled successfully!", threadID, messageID);
    }

    if (action === "remove") {
      data.activeGroups = data.activeGroups.filter(id => id !== threadID);
      fs.writeJsonSync(filePath, data);
      return api.sendMessage("❌ Disabled successfully!", threadID, messageID);
    }

    if (action === "list") {
      if (!data.activeGroups.length)
        return api.sendMessage("🚫 No active groups found.", threadID, messageID);

      let listMsg = "💞 ACTIVE TCP GROUP LIST 💞\n\n";

      for (const tID of data.activeGroups) {
        const info = await api.getThreadInfo(tID);
        listMsg += `Group: ${info.threadName || "Unknown"}\nUID: ${tID}\n\n`;
      }

      return api.sendMessage(listMsg, threadID, messageID);
    }

    return api.sendMessage(
      "Invalid command! Use: add | remove | list",
      threadID,
      messageID
    );
  }
};
