const os = require("os");
const path = require("path");
const fs = require("fs");
const { createCanvas } = require("canvas");

process.stderr.clearLine = process.stderr.clearLine || function () {};
process.stdout.clearLine = process.stdout.clearLine || function () {};

module.exports = {
  config: {
    name: "uptime",
    aliases: ["runtime", "up"],
    version: "2.0",
    author: "NZ R x Nazim Edit",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Stylish system uptime card"
    },
    longDescription: {
      en: "Displays bot uptime, ram, cpu, ping and system details in a stylish card."
    },
    category: "SYSTEM",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    const cacheFolder = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheFolder))
      fs.mkdirSync(cacheFolder, { recursive: true });

    const imagePath = path.join(cacheFolder, `uptime_${Date.now()}.png`);

    try {
      api.setMessageReaction("⚡", messageID, () => {}, true);

      // ===== UPTIME =====
      const uptime = process.uptime();

      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString =
        `${days}D ${hours}H ${minutes}M ${seconds}S`;

      // ===== RAM =====
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      const usedGB = (usedMem / 1024 / 1024 / 1024).toFixed(2);
      const totalGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);

      // ===== CPU =====
      const cpus = os.cpus();

      let totalIdle = 0;
      let totalTick = 0;

      cpus.forEach(cpu => {
        for (const type in cpu.times)
          totalTick += cpu.times[type];

        totalIdle += cpu.times.idle;
      });

      const cpuUsage =
        ((1 - totalIdle / totalTick) * 100).toFixed(1);

      // ===== OTHER INFO =====
      const ping = Date.now() - event.timestamp;
      const platform = `${os.platform()} (${os.arch()})`;
      const hostname = os.hostname();
      const nodeVersion = process.version;
      const cpuModel = cpus[0].model;

      // ===== CANVAS =====
      const width = 1400;
      const height = 850;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ===== BG =====
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#0f172a");
      bg.addColorStop(1, "#020617");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // ===== GLOW =====
      ctx.beginPath();
      ctx.arc(250, 180, 180, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(168,85,247,0.18)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(1150, 650, 200, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59,130,246,0.18)";
      ctx.fill();

      // ===== MAIN CARD =====
      ctx.fillStyle = "rgba(15,23,42,0.92)";
      roundRect(ctx, 80, 70, 1240, 700, 45, true);

      // ===== TITLE =====
      ctx.font = "bold 58px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("SYSTEM STATUS", width / 2, 150);

      ctx.font = "28px Sans";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Realtime Bot Monitoring", width / 2, 195);

      // ===== INFO BOXES =====
      const data = [
        ["⚡ Uptime", uptimeString],
        ["📶 Ping", `${ping} ms`],
        ["🧠 RAM", `${usedGB} GB / ${totalGB} GB`],
        ["💻 CPU", `${cpuUsage}% Usage`],
        ["🖥️ Platform", platform],
        ["🌐 Node.js", nodeVersion],
        ["📌 Hostname", hostname],
        ["🔥 Processor", cpuModel.slice(0, 35)]
      ];

      let x = 140;
      let y = 250;

      data.forEach((item, index) => {
        drawBox(ctx, x, y, item[0], item[1]);

        if ((index + 1) % 2 === 0) {
          y += 120;
          x = 140;
        } else {
          x = 720;
        }
      });

      // ===== FOOTER =====
      ctx.font = "24px Sans";
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "center";
      ctx.fillText(
        "Powered By GoatBot • Stylish Uptime Card",
        width / 2,
        740
      );

      // ===== SAVE =====
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);

      await api.sendMessage(
        {
          body:
            `⚡ SYSTEM STATUS\n\n` +
            `⏰ Uptime: ${uptimeString}\n` +
            `📶 Ping: ${ping}ms\n` +
            `🧠 RAM: ${usedGB}/${totalGB} GB\n` +
            `💻 CPU Usage: ${cpuUsage}%`,
          attachment: fs.createReadStream(imagePath)
        },
        threadID,
        () => fs.unlinkSync(imagePath),
        messageID
      );

      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.log(err);

      api.sendMessage(
        `❌ Error: ${err.message}`,
        threadID,
        messageID
      );
    }
  }
};

// ===== DRAW BOX =====
function drawBox(ctx, x, y, title, value) {
  ctx.fillStyle = "rgba(30,41,59,0.9)";
  roundRect(ctx, x, y, 500, 85, 28, true);

  ctx.font = "bold 28px Sans";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(title, x + 30, y + 35);

  ctx.font = "26px Sans";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(value, x + 30, y + 68);
}

// ===== ROUND RECT =====
function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);

  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );

  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);

  ctx.closePath();

  if (fill) ctx.fill();
              }
