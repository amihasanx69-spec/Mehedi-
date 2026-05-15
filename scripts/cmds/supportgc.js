const path = require("path");

// SAFE LOAD
let User;
try {
  User = require(path.join(__dirname, "../../database/models/mongodb/user"));
} catch (e) {
  console.log("❌ User model load failed:", e.message);
}

module.exports = {
  config: {
    name: "supportgc",
    version: "4.1",
    author: "MOHAMMAD AKASH",
    role: 0,
    category: "supportgc",
  },

  onStart: async function ({ api, event }) {

    const supportGroupId = "2093429191430879";

    // ✅ SUPPORT ADMINS
    const adminUIDs = [
      "61588972996269",
      "61586144220686"
    ];

    const userID = event.senderID;
    const threadID = event.threadID;

    try {

      // ❗ USER MODEL CHECK
      if (!User) {
        return api.sendMessage("❌ User model path error!", threadID);
      }

      // ✅ USER INFO
      let userName = "Unknown";
      try {
        const info = await api.getUserInfo(userID);
        userName = info[userID]?.name || "Unknown";
      } catch (e) {
        console.log("UserInfo error:", e.message);
      }

      const args = (event.body || "").split(" ");
      const sub = args[1];

      // ================= LIST =================
      if (sub === "list") {

        const info = await api.getThreadInfo(supportGroupId);
        const members = info.participantIDs;

        let msg = `👥 SUPPORT MEMBER LIST\n\n`;

        for (let i = 0; i < members.length; i++) {
          msg += `${i + 1}. ${members[i]}\n`;
        }

        msg += `\n📊 Total Members: ${members.length}`;

        return api.sendMessage(msg, threadID);
      }

      // ================= DATABASE CHECK =================
      let data = await User.findOne({ userID });

      if (!data) {
        data = new User({
          userID,
          name: userName,
          supportJoined: false,
          supportHistory: []
        });
      }

      // ALREADY JOINED
      if (data.supportJoined) {
        return api.sendMessage(
          `📌 ${userName}, তুমি already support group এ আছো 😎`,
          threadID
        );
      }

      // CHECK GROUP
      const threadInfo = await api.getThreadInfo(supportGroupId);

      if (threadInfo.participantIDs.includes(userID)) {

        data.supportJoined = true;
        await data.save();

        return api.sendMessage(
          `📌 ${userName}, তুমি already support group এ আছো 😎`,
          threadID
        );
      }

      // ================= ADD USER =================
      api.addUserToGroup(userID, supportGroupId, async (err) => {

        if (err) {
          console.log("Add error:", err);

          return api.sendMessage(
            `⚠️ ${userName} কে add করা যায়নি!`,
            threadID
          );
        }

        // SAVE DB
        data.supportJoined = true;
        data.supportHistory.push({
          joinedAt: new Date()
        });

        await data.save();

        // SUCCESS MSG
        api.sendMessage(
          `✅ ${userName} successfully support group এ add হয়েছে 😎`,
          threadID
        );

        // GROUP ALERT
        api.sendMessage(
          `📌 NEW SUPPORT MEMBER\n\n👤 Name: ${userName}\n🆔 UID: ${userID}`,
          supportGroupId
        );

        // ADMIN ALERT
        for (const adminID of adminUIDs) {
          api.sendMessage(
            `📩 New Support Join\n\n👤 ${userName}\n🆔 ${userID}`,
            adminID
          );
        }

      });

    } catch (err) {

      console.log("FULL ERROR:", err);

      api.sendMessage(
        `⚠️ Real error:\n${err.message}`,
        threadID
      );
    }
  }
};
