module.exports = {
  config: {
    name: "antiout",
    version: "7.2",
    author: "Hasan X + ChatGPT",
    role: 0,
    shortDescription: "Funny Anti Leave System (Fixed + Ultra Funny)",
    category: "boxchat",
    guide: "{pn} on/off"
  },

  onStart: async function ({ message, event, threadsData, args }) {

    if (!args[0])
      return message.reply("⚡ Use:\nantiout on\nantiout off");

    const option = args[0].toLowerCase();

    if (!["on", "off"].includes(option))
      return message.reply("❌ Only use on/off");

    const status = option === "on";

    await threadsData.set(event.threadID, status, "settings.antiout");

    return message.reply(
      status
        ? "✅ Antiout ON 😹\nএখন কেউ পালাতে পারবে না 🐸"
        : "❌ Antiout OFF 🥱"
    );
  },

  onEvent: async function ({ api, event, threadsData, usersData }) {

    try {
      if (event.logMessageType !== "log:unsubscribe") return;

      const antiout = await threadsData.get(
        event.threadID,
        "settings.antiout"
      );

      if (!antiout) return;

      const leftID = event.logMessageData?.leftParticipantFbId;
      const botID = api.getCurrentUserID();

      if (!leftID || leftID === botID) return;

      // safe check (avoid fake triggers)
      if (event.author && leftID !== event.author) return;

      // re-add user
      await api.addUserToGroup(leftID, event.threadID);

      const name = await usersData.getName(leftID) || "User";

      const msgList = [
        `😹 ${name} কোথায় যাস রে?`,
        `🚪 দরজা বন্ধ ছিল তাও পালাইতে গেছিলি 🤡`,
        `🐸 Hasan Boss তোকে আবার টেনে আনছে!`,
        `📌 এই গ্রুপ থেকে leave নেওয়া নিষিদ্ধ 😹`,
        `🫵 ধরা খাইছস আবার add হইয়া গেছস!`,
        `😼 পালাতে গেছিলি? সিস্টেম তোকে ফিরায় আনছে!`,
        `🤖 Escape denied! Welcome back 😹`,
        `🐷 গ্রুপ ছাড়ার পরিণাম = আবার ঢোকা 🤡`,

        // 🔥 FUNNY UPGRADE PACK
        `😂 ${name} ভাবছিলি পালাবি, কিন্তু সার্ভার তো হাসতেছে 🤖`,
        `🐸 তোকে ছাড়া গ্রুপ শূন্য লাগে না, শূন্য আবার full করে দিলাম 😹`,
        `🚔 পালানো অপরাধ, শাস্তি = আবার group jail 😆`,
        `🤡 ${name} = Try again failed successfully 😭`,
        `💀 তুই পালাইস নাই, তুই শুধু লোডিং স্ক্রিনে আটকা ছিলি 😹`,
        `📡 Signal lost… but system found you anyway 🤖`,
        `🐷 গ্রুপ ছাড়তে গেছিলি? আমরা তো স্ক্রিপ্ট দিয়ে বান্দি বানাই 😆`,
        `⚠️ Warning: ${name} tried to escape… result: clown reset 🤡`,
        `🧠 ব্রেইন: পালা 😎 | সিস্টেম: না 😈 | result: ${name} ফিরে আসছে 😹`,
        `🎯 Mission failed successfully: ${name} detected again 🤖`
      ];

      const randomMsg = msgList[Math.floor(Math.random() * msgList.length)];

      return api.sendMessage(
        {
          body: randomMsg,
          mentions: [
            {
              tag: name,
              id: leftID
            }
          ]
        },
        event.threadID
      );

    } catch (err) {
      console.log("Antiout Error Fixed:", err);
    }
  }
};
