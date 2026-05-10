module.exports = {
  config: {
    name: "antiout",
    version: "7.0",
    author: "Hasan X + ChatGPT",
    role: 0,
    shortDescription: "Funny Anti Leave System",
    category: "boxchat",
    guide: "{pn} on/off"
  },

  onStart: async function ({ message, event, threadsData, args }) {

    if (!args[0])
      return message.reply("⚡ Use:\nantiout on\nantiout off");

    const option = args[0].toLowerCase();

    if (option !== "on" && option !== "off")
      return message.reply("❌ Only use on/off");

    const status = option === "on";

    await threadsData.set(
      event.threadID,
      status,
      "settings.antiout"
    );

    return message.reply(
      status
        ? "✅ Antiout ON 😹\nএখন কেউ পালাতে পারবে না 🐸"
        : "❌ Antiout OFF 🥱"
    );
  },

  onEvent: async function ({ api, event, threadsData, usersData }) {

    if (event.logMessageType !== "log:unsubscribe") return;

    const antiout = await threadsData.get(
      event.threadID,
      "settings.antiout"
    );

    if (!antiout) return;

    const leftID = event.logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();

    // ignore bot itself
    if (leftID == botID) return;

    // only real self-leave
    if (leftID != event.author) return;

    setTimeout(async () => {

      try {

        await api.addUserToGroup(leftID, event.threadID);

        const name = await usersData.getName(leftID);

        const msg = [
          `😹 @${name} কোথায় যাস রে?`,
          `🚪 দরজা বন্ধ ছিল তাও পালাইতে গেছিলি 🤡`,
          `🐸 Hasan Boss তোকে আবার টেনে আনছে!`,
          `📌 এই গ্রুপ থেকে leave নেওয়া নিষিদ্ধ 😹`,
          `🫵 ধরা খাইছস আবার add হইয়া গেছস!`,
          `😼 পালাতে গেছিলি? সিস্টেম তোকে ফিরায় আনছে!`,
          `🤖 Escape denied! Welcome back 😹`,
          `🐷 গ্রুপ ছাড়ার পরিণাম = আবার ঢোকা 🤡`
        ];

        const randomMsg =
          msg[Math.floor(Math.random() * msg.length)];

        api.sendMessage({
          body: randomMsg,
          mentions: [{
            tag: name,
            id: leftID
          }]
        }, event.threadID);

      } catch (e) {
        console.log("Antiout Error:", e);
      }

    }, 4000);
  }
};
