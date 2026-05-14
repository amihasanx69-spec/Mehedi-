const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "hack",
    version: "2.0.0",
    author: "NAZRUL + Stylish Fix",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Stylish fake hack image 😎"
    },
    longDescription: {
      en: "Generate stylish fake hacking image with profile photo"
    },
    category: "fun",
    guide: {
      en: "{pn} @mention/reply"
    }
  },

  wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    let lines = [];
    let line = "";

    for (const word of words) {
      const testLine = line + word + " ";
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth && line !== "") {
        lines.push(line);
        line = word + " ";
      } else {
        line = testLine;
      }
    }

    lines.push(line);
    return lines;
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      const uid =
        Object.keys(event.mentions)[0] ||
        event.messageReply?.senderID ||
        event.senderID;

      const name = await usersData.getName(uid);

      const cachePath = __dirname + "/cache";
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const bgPath = cachePath + "/hack_bg.png";
      const avPath = cachePath + "/hack_av.png";
      const outPath = cachePath + "/hack_out.png";

      // Stylish Background
      const bgUrl =
        "https://i.imgur.com/YD6kKki.jpeg";

      // Avatar Download
      const avatar = (
        await axios.get(
          `https://graph.facebook.com/${uid}/picture?width=720&height=720`,
          { responseType: "arraybuffer" }
        )
      ).data;

      fs.writeFileSync(avPath, Buffer.from(avatar));

      // Background Download
      const background = (
        await axios.get(bgUrl, {
          responseType: "arraybuffer"
        })
      ).data;

      fs.writeFileSync(bgPath, Buffer.from(background));

      // Canvas
      const bg = await loadImage(bgPath);
      const av = await loadImage(avPath);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Avatar Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(140, 160, 70, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av, 70, 90, 140, 140);
      ctx.restore();

      // Red Border
      ctx.beginPath();
      ctx.arc(140, 160, 72, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#ff0000";
      ctx.stroke();

      // Hacker Name
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#00ff00";
      ctx.textAlign = "left";

      const lines = this.wrapText(ctx, name, 700);

      let y = 330;
      for (const line of lines) {
        ctx.fillText(line, 70, y);
        y += 45;
      }

      // Fake Hacking Text
      ctx.font = "28px Arial";
      ctx.fillStyle = "#ffffff";

      ctx.fillText("SYSTEM HACKING...", 70, 430);
      ctx.fillText("ACCESS GRANTED ✔", 70, 480);
      ctx.fillText("PASSWORD CRACKED ✔", 70, 530);

      // Progress Bar
      ctx.fillStyle = "#222";
      ctx.fillRect(70, 590, 500, 35);

      ctx.fillStyle = "#00ff00";
      ctx.fillRect(70, 590, 500, 35);

      ctx.font = "bold 25px Arial";
      ctx.fillStyle = "#000";
      ctx.fillText("100%", 280, 617);

      // Footer
      ctx.font = "20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("NAZRUL HACK SYSTEM 😈", 70, 690);

      // Save
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outPath, buffer);

      await message.reply({
        body: `😈 ${name} Successfully Hacked!`,
        attachment: fs.createReadStream(outPath)
      });

      // Clean
      fs.unlinkSync(bgPath);
      fs.unlinkSync(avPath);
      fs.unlinkSync(outPath);

    } catch (err) {
      console.log(err);
      return message.reply("❌ Error while generating hack image!");
    }
  }
};
