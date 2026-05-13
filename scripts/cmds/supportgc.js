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
    version: "4.0",
    author: "MOHAMMAD AKASH",
    role: 0,
    category: "supportgc",
  },

  onStart: async function ({ api, event }) {

    const supportGroupId = "2093429191430879";
    const adminUID = "61588972996269";

    const userID = event.senderID;
    const threadID = event.threadID;

    try {

      // ❗ USER MODEL CHECK
      if (!User) {
        return api.sendMessage("❌ User model path error!", threadID);
      }

      // SAFE USER INFO
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

        let msg = `👥 SUPPORT LIST\n\n`;

        for (let i = 0; i < members.length; i++) {
          msg += `${i + 1}. ${members[i]}\n`;
        }

        msg += `\nTotal: ${members.length}`;

        return api.sendMessage(msg, threadID);
      }

      // ================= DB CHECK =================
      let data = await User.findOne({ userID });

      if (!data) {
        data = new User({
          userID,
          name: userName,
          supportJoined: false,
          supportHistory: []
        });
      }

      if (data.supportJoined) {
        return api.sendMessage(
          `📌 ${userName}, already support member 😎`,
          threadID
        );
      }

      const threadInfo = await api.getThreadInfo(supportGroupId);

      if (threadInfo.participantIDs.includes(userID)) {
        data.supportJoined = true;
        await data.save();

        return api.sendMessage(
          `📌 ${userName}, already in support group 😎`,
          threadID
        );
      }

      // ADD USER
      api.addUserToGroup(userID, supportGroupId, async (err) => {

        if (err) {
          console.log("Add error:", err);
          return api.sendMessage(
            `⚠️ Cannot add ${userName}`,
            threadID
          );
        }

        data.supportJoined = true;
        await data.save();

        api.sendMessage(`✅ Added ${userName}`, threadID);

        api.sendMessage(
          `📌 SUPPORT ALERT\n\n👤 ${userName}\n🆔 ${userID}`,
          supportGroupId
        );

        api.sendMessage(
          `📌 New user: ${userName}`,
          adminUID
        );
      });

    } catch (err) {
      console.log("FULL ERROR:", err);
      api.sendMessage(
        `⚠️ Real error: ${err.message}`,
        threadID
      );
    }
  }
};
