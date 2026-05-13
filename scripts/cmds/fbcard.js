const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");
const jimp = require("jimp");

const { createCanvas, loadImage, registerFont } = Canvas;

module.exports = {
  config: {
    name: "fbcard",
    version: "7.0",
    author: "kshitiz + Full Fix ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Advanced Facebook Card"
    },
    category: "logo",
    guide: {
      en: "{pn} [uid/@mention/reply]"
    }
  },

  onStart: async function ({ api, event, args }) {

    try {

      // ===== UID SYSTEM =====
      let uid;

      if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }

      else if (args[0] && !isNaN(args[0])) {
        uid = args[0];
      }

      else if (event.type == "message_reply") {
        uid = event.messageReply.senderID;
      }

      else {
        uid = event.senderID;
      }

      // ===== CACHE =====
      const cache = path.join(__dirname, "cache");

      if (!fs.existsSync(cache)) {
        fs.mkdirSync(cache, { recursive: true });
      }

      const avatarPath = path.join(cache, `${uid}_avatar.png`);
      const outputPath = path.join(cache, `${uid}_fbcard.png`);
      const fontPath = path.join(cache, "Play-Bold.ttf");

      // ===== FONT =====
      if (!fs.existsSync(fontPath)) {

        const fontData = (
          await axios.get(
            "https://raw.githubusercontent.com/google/fonts/main/ofl/play/Play-Bold.ttf",
            { responseType: "arraybuffer" }
          )
        ).data;

        fs.writeFileSync(fontPath, Buffer.from(fontData));
      }

      registerFont(fontPath, {
        family: "PlayBold"
      });

      // ===== USER INFO =====
      const userInfo = await api.getUserInfo(uid);

      const user = userInfo?.[uid] || {};

      // 🔥 FIXED NAME (UNIVERSAL)
      const name =
        user.name ||
        user.firstName ||
        user.fullName ||
        user.displayName ||
        user.alternateName ||
        "Facebook User";

      // ===== EXTRA INFO =====
      const gender = "Unknown";
      const dob = "Private";
      const relationship = "Unknown";
      const hometown = "Unknown";

      // ===== AVATAR =====
      const avatarURL =
        `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

      const avatar = (
        await axios.get(avatarURL, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        })
      ).data;

      fs.writeFileSync(avatarPath, Buffer.from(avatar));

      // ===== CIRCLE =====
      const image = await jimp.read(avatarPath);

      image.circle();

      await image.writeAsync(avatarPath);

      // ===== BIG CARD =====
      const canvas = createCanvas(1400, 800);

      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(40, 40, 1320, 720);

      ctx.fillStyle = "#00FFFF";
      ctx.fillRect(40, 40, 1320, 8);

      const avatarImg = await loadImage(avatarPath);

      ctx.drawImage(avatarImg, 90, 170, 340, 340);

      ctx.font = "bold 55px PlayBold";
      ctx.fillStyle = "#00FFFF";

      ctx.fillText("FACEBOOK PROFILE CARD", 500, 120);

      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(500, 145);
      ctx.lineTo(1220, 145);
      ctx.stroke();

      // ===== INFO =====
      ctx.font = "36px PlayBold";
      ctx.fillStyle = "#FFFFFF";

      ctx.fillText(`NAME : ${name}`, 500, 230);
      ctx.fillText(`UID : ${uid}`, 500, 290);
      ctx.fillText(`GENDER : ${gender}`, 500, 350);
      ctx.fillText(`DATE OF BIRTH : ${dob}`, 500, 410);
      ctx.fillText(`RELATIONSHIP : ${relationship}`, 500, 470);
      ctx.fillText(`HOMETOWN : ${hometown}`, 500, 530);

      ctx.fillText(
        `PROFILE : facebook.com/${uid}`,
        500,
        590
      );

      ctx.font = "28px PlayBold";
      ctx.fillStyle = "#00FFFF";

      ctx.fillText("Generated Successfully ✓", 90, 740);

      const buffer = canvas.toBuffer("image/png");

      fs.writeFileSync(outputPath, buffer);

      await api.sendMessage(
        {
          body: `✅ FB CARD GENERATED FOR ${name}`,
          attachment: fs.createReadStream(outputPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
        },
        event.messageID
      );

    } catch (err) {
      return api.sendMessage(
        `❌ Error:\n${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
