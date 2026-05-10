const { ShAnImgur, ShAnalbumAdd, ShAnalbumDelete, ShAnalbumList, ShAnalbumVideos } = require("shan-server");
const axios = require("axios");
const fs = require("fs");
const path = require("path");


const categoryConfig = {
  displayNames: [
    "𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐡𝐚𝐲𝐚𝐫𝐢 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐄𝐲𝐞𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐚𝐫𝐭𝐨𝐨𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐎𝐠𝐠𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐌𝐞𝐫𝐯𝐞𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨",
    "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐆𝐢𝐫𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐨𝐫𝐫𝐨𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐢𝐤𝐞 & 𝐂𝐚𝐫 𝐕𝐢𝐝𝐞𝐨",
    "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐲𝐫𝐢𝐜𝐚𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨", "𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨",
    "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐏𝐮𝐛𝐠 𝐯𝐢𝐝𝐞𝐨", "𝐀𝐞𝐬𝐭𝐡𝐞𝐭𝐢𝐜 𝐕𝐢𝐝𝐞𝐨",
    "𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐫𝐚𝐠𝐨𝐧 𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐥𝐞𝐚𝐜𝐋 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐞𝐦𝐨𝐧 𝐬𝐲𝐥𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", 
    "𝐉𝐮𝐣𝐮𝐭𝐬𝐮 𝐊𝐚𝐢𝐬𝐞𝐧 𝐯𝐢𝐝𝐞𝐨", "𝐒𝐨𝐥𝐨 𝐥𝐞𝐯𝐞𝐥𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨", "𝐓𝐨𝐤𝐲𝐨 𝐫𝐞𝐯𝐞𝐧𝐠𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", 
    "𝐁𝐥𝐮𝐞 𝐥𝐨𝐜𝐤 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐡𝐚𝐢𝐧𝐬𝐚𝐰 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐞𝐚𝐭𝐋 𝐧𝐨𝐭𝐞 𝐯𝐢𝐃𝐞𝐨", "𝐎𝐧𝐞 𝐏𝐢𝐞𝐜𝐞 𝐕𝐢𝐝𝐞𝐨", 
    "𝐀𝐭𝐭𝐚𝐜𝐤 𝐨𝐧 𝐓𝐢𝐭𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐚𝐤𝐚𝐦𝐨𝐭𝐨 𝐃𝐚𝐲𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐰𝐢𝐧𝐝 𝐛𝐫𝐞𝐚𝐤𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", 
    "𝐎𝐧𝐞 𝐩𝐮𝐧𝐜𝐋 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐥𝐲𝐚 𝐑𝐮𝐬𝐬𝐢𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐥𝐮𝐞 𝐛𝐨𝐱 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐮𝐧𝐭𝐞𝐫 𝐱 𝐇𝐮𝐧𝐭𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", 
    "𝐋𝐨𝐧𝐞𝐫 𝐥𝐢𝐟𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐚𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨"
  ],
  realCategories: [
    "funny", "islamic", "sad", "shayari", "anime", "eyes", "cartoon", "oggy", "marvel", "lofi", "attitude", "girl", "horny", "horror", "couple",
    "flower", "bikecar", "love", "lyrical", "lyrics", "cat", "18+", "freefire",
    "football", "baby", "friend", "pubg", "aesthetic", "naruto", "dragon", "bleach", 
    "demon", "jjk", "solo", "tokyo", "bluelock", "cman", "deathnote", "onepiece", 
    "attack", "sakamoto", "wind", "onepman", "alya", "bluebox", "hunter", "loner", "hanime"
  ],
  captions: [
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😺",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <✨",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐢 𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐏𝐲 <😢",
    "𝐇𝐚𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐡𝐚𝐲𝐚𝐫𝐢 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐏𝐲<😗",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐄𝐲𝐞𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👀",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐚𝐫𝐭𝐨𝐨𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐁𝐲<😘",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐎𝐠𝐠𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐁𝐲<🐥",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐌𝐚𝐫𝐯𝐞𝐥 𝐌𝐨𝐯𝐢𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎬",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎶",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <☠️",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐆𝐢𝐫𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥵",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐔𝐫 𝐇𝐨𝐫𝐫𝐨𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👻",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐔𝐫 𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <💑",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌸",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐢𝐤𝐞 & 𝐂𝐚𝐫 𝐕𝐢𝐃𝐞𝐨 𝐁𝐚𝐛𝐲 <😘",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐯𝐞 𝐯𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <❤",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐲𝐫𝐢𝐜𝐚𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎵",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎵",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐱",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝟖+ 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥵",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 🔥",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <⚽",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐥",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👭",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐏𝐮𝐛𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐥",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐞𝐬𝐭𝐡𝐞𝐭𝐢𝐜 𝐯𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐫𝐚𝐠𝐨𝐧 𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐞𝐚𝐜𝐡 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐞𝐦𝐨𝐧 𝐬𝐲𝐥𝐞𝐫 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐉𝐮𝐣𝐢𝐭𝐬𝐮 𝐊𝐚𝐢𝐬𝐞𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐨𝐥𝐨 𝐥𝐞𝐯𝐞𝐥𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐓𝐨𝐤𝐲𝐨 𝐫𝐞𝐯𝐞𝐧𝐠𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐮𝐞 𝐥𝐨𝐜𝐤 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐡𝐚𝐢𝐧𝐬𝐚𝐰 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐞𝐚𝐭𝐡 𝐧𝐨𝐭𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐎𝐧𝐞 𝐏𝐢𝐞𝐜𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐓𝐭𝐚𝐜𝐤 𝐨𝐧 𝐓𝐢𝐐𝐭𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐚𝐤𝐚𝐦𝐨𝐭𝐨 𝐃𝐚𝐲𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐰𝐢𝐧𝐝 𝐛𝐫𝐞𝐚𝐤𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐎𝐧𝐞 𝐩𝐢𝐧𝐜𝐡 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐥𝐲𝐚 𝐑𝐮𝐬𝐬𝐢𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐮𝐞 𝐛𝐨𝐱 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐮𝐧𝐭𝐞𝐫 𝐱 𝐇𝐮𝐧𝐭𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐧𝐞𝐫 𝐥𝐢𝐟𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
    "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐚𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟"
  ]
};

module.exports = { 
  config: { 
    name: "album", 
    version: "2.0.3", 
    role: 0, 
    usePrefix: false, 
    author: "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
    shortDescription: {
      en: "𝐕𝐢𝐝𝐞𝐨 𝐚𝐥𝐛𝐮𝐦..",
      bn: "ভিডিও অ্যালবাম"
    },
    longDescription: {
      en: "𝐕𝐢𝐝𝐞𝐨 𝐚𝐥𝐛𝐮𝐦 𝐚𝐝𝐝 𝐚𝐧𝐝 𝐬𝐡𝐨𝐰 𝐰𝐢𝐭𝐡 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲...",
      bn: "ভিডিও অ্যালবাম বিভাগ সহ যোগ করুন এবং দেখান"
    },
    category: "media", 
    guide: { 
      en: "{p}{n} [𝐩𝐚𝐠𝐞 𝐧𝐮𝐦𝐛𝐞𝐫] 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞 (𝐞.𝐠., {p}{n} 2)\n{p}{n} [𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲/-𝐜] 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐯𝐚𝐥𝐢𝐚𝐛𝐥𝐞 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲\n{p}{n} [𝐚𝐝𝐝/-𝐚] [𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲] 𝐚𝐧𝐝 𝐫𝐞𝐩𝐥𝐲 𝐚 𝐯𝐢𝐝𝐞𝐨 𝐨𝐫 [𝐔𝐑𝐋]\n{p}{n} [𝐝𝐞𝐥𝐞𝐭𝐞/-𝐝] 𝐭𝐨 𝐝𝐞𝐥𝐞𝐭𝐞 𝐯𝐢𝐝𝐞𝐨 \n{p}{n} [𝐥𝐢𝐬𝐭/-𝐥] 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐯𝐚𝐥𝐢𝐚𝐛𝐥𝐞 𝐯𝐢𝐝𝐞𝐨 𝐚𝐧𝐝 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲...",
      bn: "{p}{n} [𝐩𝐚𝐠𝐞 𝐧𝐮𝐦𝐛𝐞𝐫] পরের পেজ দেখার জন্য (যেমন, {p}{n} 2)\n{p}{n} [𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲/-𝐜] ক্যাটাগরি দেখার জন্য\n{p}{n} [𝐚𝐝𝐝/-𝐚] [ক্যাটাগুড়ি] এবং একটি ভিডিও রিপ্লে দাও অথবা [𝐔𝐑𝐋]\n{p}{n} [𝐝𝐞𝐥𝐞𝐭𝐞/-𝐝] ভিডিও ডিলিট করার জন্য\n{p}{n} [𝐥𝐢𝐬𝐭/-𝐥] এভেলেবেল ভিডিও এবং ক্যাটাগরি দেখার জন্য..."
    }
  },
  langs: {
      en: {
        specify_category: "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐬𝐩𝐞𝐜𝐢𝐟𝐲 𝐚 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲. 𝐮𝐬𝐚𝐠𝐞:  (𝐚𝐥𝐛𝐮𝐦 𝐚𝐝𝐝 [𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲]...",
        invalid_category: "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲. 𝐮𝐬𝐚𝐠𝐞: (𝐚𝐥𝐛𝐮𝐦 -𝐜 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬...",
        only_video: "❌ 𝐎𝐧𝐥𝐲 𝐯𝐢𝐝𝐞𝐨 𝐚𝐭𝐭𝐚𝐜𝐡𝐞𝐦𝐞𝐧𝐭𝐬 𝐚𝐫𝐞 𝐚𝐥𝐥𝐨𝐰𝐞𝐝...",
        invalid_response: "𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐟𝐫𝐨𝐦 𝐀𝐏𝐈: %1",
        upload_fail: "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐮𝐩𝐥𝐨𝐚𝐝 𝐀𝐏𝐈: %1",
        need_url: "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐯𝐢𝐝𝐞𝐨 𝐔𝐑𝐋 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐯𝐢𝐝𝐞𝐨 𝐚𝐭𝐭𝐚𝐜𝐡𝐞𝐦𝐞𝐧𝐭𝐬...",
        add_error: "❌ 𝐄𝐫𝐫𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨: %1",
        list_error: "❌ 𝐄𝐫𝐫𝐨𝐫 𝐟𝐚𝐭𝐜𝐡𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨 𝐥𝐢𝐬𝐭: %1",
        needMoney: "𝐅𝐨𝐤𝐢𝐫! 𝐓𝐮𝐢 𝐭𝐨𝐡 𝐠𝐨𝐫𝐢𝐛, 𝐭𝐨𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: %1?! 😤!",
        invalid_page: "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐩𝐚𝐠𝐞! 𝐏𝐥𝐞𝐚𝐬𝐞 𝐜𝐡𝐨𝐨𝐬𝐞 𝐛𝐞𝐭𝐰𝐞𝐞𝐧 1 - %1.",
        invalid_reply: "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐥𝐢𝐬𝐭...",
        no_videos: "❌ | 𝐍𝐨 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐜𝐚𝐞𝐠𝐨𝐫𝐲.",
        send_fail: "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐯𝐢𝐝𝐞𝐨. 𝐝𝐞𝐥𝐞𝐭𝐞 𝐭𝐡𝐢𝐬: %1",
        download_fail: "❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨...",
        api_fail: "❌ 𝐄𝐫𝐫𝐨𝐫 𝐰𝐡𝐢𝐭𝐞 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐀𝐏𝐈. 𝐏𝐥𝐞𝐚𝐬𝐞𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫...",
        category: "👇\n%1\n👆"
      },
      bn: {
        specify_category: "❌ অনুগ্রহ করে একটি ক্যাটেগরি দিন। ব্যবহার: (𝐚𝐥𝐛𝐮𝐦 𝐚𝐝𝐝 [ক্যাটেগরি]",
        invalid_category: "❌ ভুল ক্যাটেগরি। উপলব্ধ ক্যাটেগরি দেখতে (𝐚𝐥𝐛𝐮𝐦 -𝐜 ব্যবহার করুন।",
        only_video: "❌ শুধু ভিডিও ফাইল অনুমোদিত।",
        invalid_response: "𝐀𝐏𝐈 থেকে কোনো প্রতিক্রিয়া পাওয়া যায়নি...",
        upload_fail: "❌ ভিডিও আপলোড ব্যর্থ: %1",
        need_url: "❌ একটি ভিডিও লিঙ্ক দিন অথবা ভিডিও রিপ্লাই করুন...",
        needMoney: "ফকির! তুই তো গরিব, তোর ব্যালান্স: %1?! 😤!",
        add_error: "❌ ভিডিও যোগ করতে সমস্যা: %1",
        list_error: "❌ ভিডিও তালিকা আনতে সমস্যা: %1",
        invalid_page: "❌ ভুল পৃষ্ঠা! অনুগ্রহ করে 1 - %1 এর মধ্যে বেছে নিন।",
        invalid_reply: "❌ অনুগ্রহ করে তালিকা থেকে একটি সঠিক নাম্বার দিন।",
        no_videos: "❌ | এই ক্যাটেগরিতে কোনো ভিডিও পাওয়া যায়নি।",
        send_fail: "❌️ ভিডিও পাঠানো যায়নি। এটি মুছে ফেলুন: %1",
        download_fail: "❌ ভিডিও ডাউনলোড ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।",
        api_fail: "❌ এপিআই থেকে ভিডিও আনার সময় ত্রুটি হয়েছে। পরে চেষ্টা করুন।",
        category: "👇\n%1\n👆"
      }
    },

  onStart: async function ({ api, event, args, getLang, usersData }) { 
    const { messageID, threadID, senderID } = event;
    
    if (args[0] === "category" || args[0] === "-c") {
      return api.sendMessage(getLang("category", categoryConfig.realCategories.join("\n")), threadID, messageID);
    }

    if (args[0] === "add" || args[0] === "-a") {
      if (!args[1]) {
        return api.sendMessage(getLang("specify_category"), threadID, messageID);
      }

      const category = args[1].toLowerCase();
      if (!categoryConfig.realCategories.includes(category)) {
        return api.sendMessage(getLang("invalid_category"), threadID, messageID);
      }

      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];
        
        if (attachment.type !== "video") {
          return api.sendMessage(getLang("only_video"), threadID, messageID);
        }

        try {
          const ShAn2 = await ShAnImgur(attachment.url, this.config.author );

          if (!ShAn2.ShAn) {
            return api.sendmessages(getLang("invalid_response"));
          }

          const ShaN = ShAn2.ShAn;
          
          const ShAn3 = await ShAnalbumAdd(category, ShaN, senderID, this.config.author);

          return api.sendMessage(ShAn3.ShAn, threadID, messageID);
        } catch (error) {
          const eMsg = error.response.data.error || error.message;
          return api.sendMessage(getLang("upload_fail", eMsg), threadID, messageID);
        }
      }

      if (!args[2]) {
        return api.sendMessage(getLang("need_url"), threadID, messageID);
      }

      const videoUrl = args[2];
      try {
        const ShAn4 = await ShAnalbumAdd(category, videoUrl, senderID, this.config.author);

        return api.sendMessage(ShAn4.ShAn, threadID, messageID);
      } catch (error) {
        const errorMsg = error.response.data.error || error.message;
        return api.sendMessage(getLang("add_error", errorMsg), threadID, messageID);
      }
    } else if (args[0] === "delete" || args[0] === "-d") {
      if (!args[1]) {
        return api.sendMessage(getLang("need_durl"), threadID, messageID);
      }
      
      const url = args[1];
      try {
        const ShAn5 = await ShAnalbumDelete(url, this.config.author);
        
        api.sendMessage(ShAn5.ShAn, threadID, messageID);
      } catch (error) {
        const emsG = error.response.data.ShAn || error.message;
        api.sendMessage(getLang("list_error", emsG), threadID, messageID);
      } 
      } else if (args[0] === "list" || args[0] === "-l") {
       try {
        const ShAn6 = await ShAnalbumList(this.config.author);
        api.sendMessage(ShAn6.ShAn, threadID, messageID);
      } catch (error) {
        const emsG = error.response.data.error || error.message;
        api.sendMessage(getLang("list_error", emsG), threadID, messageID);
      }
    } else {
      const itemsPerPage = 10;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(categoryConfig.displayNames.length / itemsPerPage);

      if (page < 1 || page > totalPages) {
        return api.sendMessage(getLang("invalid_page", totalPages), event.threadID, event.messageID);
      }

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const displayedCategories = categoryConfig.displayNames.slice(startIndex, endIndex);

      const message = `𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨 𝐋𝐢𝐬𝐭 🎀\n` +
        "𐙚━━━━━━━━━━━━━━━━━━━━ᡣ𐭩\n" +
        displayedCategories.map((option, index) => `${startIndex + index + 1}. ${option}`).join("\n") +
        "\n𐙚━━━━━━━━━━━━━━━━━━━━ᡣ𐭩" +
        `\n♻ | 𝐏𝐚𝐠𝐞 [${page}/${totalPages}]<😘\nℹ | 𝐓𝐲𝐩𝐞 (album ${page + 1} - 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞.`.repeat(page < totalPages);

      await api.sendMessage(message, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          page,
          startIndex,
          displayNames: categoryConfig.displayNames,
          realCategories: categoryConfig.realCategories,
          captions: categoryConfig.captions
        });
      }, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply, getLang, usersData }) {
    const { messageID, threadID, senderID } = event;
    api.unsendMessage(Reply.messageID);


    const reply = parseInt(event.body);
    const index = reply - 1;

    if (isNaN(reply) || index < 0 || index >= Reply.realCategories.length) {
      return api.sendMessage(getLang("invalid_reply"), threadID, messageID);
    }

    const category = Reply.realCategories[index];
    const caption = Reply.captions[index];

    try {
      const ShAn7 = await ShAnalbumVideos(category, senderID, this.config.author);

       if (ShAn7.status !== "success") {
         return api.sendMessage(SShAn7.ShAn, threadID, messageID);
       }
      
      const videoUrl = ShAn7.ShAn;
      
      if (!videoUrl) {
        return api.sendMessage(getLang("no_videos"), threadID, messageID);
      }
      
      const filePath = path.join(__dirname, "ShAn.mp4");

      const downloadFile = async (url, filePath) => {
        const response = await axios({
          url,
          method: "GET",
          responseType: "stream",
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        return new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      };

      try {
        await downloadFile(videoUrl, filePath);
        api.sendMessage(
          { body: caption, attachment: fs.createReadStream(filePath) },
          threadID,
          (err) => {
            if (err) {
              console.error(err);
              api.sendMessage(getLang("send_fail", videoUrl), threadID, messageID);
            }
            // Clean up file
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          },
          messageID
        );
        
      } catch (error) {
        console.error(error);
        api.sendMessage(getLang("download_fail"), threadID, messageID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(getLang("api_fail"), threadID, messageID);
    }
  }
};
