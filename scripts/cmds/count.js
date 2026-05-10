const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "count",
        version: "4.1.0",
        author: "Hasan x Mr.King", // ✅ author update
        countDown: 5,
        role: 0,
        aliases: ["c"],
        category: "box chat",
        shortDescription: "Message count system with ranking",
        longDescription: "Track message count, leaderboard & auto remove low active users"
    },

    onStart: async function ({ args, threadsData, message, event, api }) {
        const { threadID, senderID, messageReply, type, mentions } = event;

        const threadData = await threadsData.get(threadID) || {};
        const members = threadData.members || [];
        const adminIDs = threadData.adminIDs || [];

        const threadInfo = await api.getThreadInfo(threadID);
        const usersInGroup = threadInfo.participantIDs || [];

        const isGroupAdmin = adminIDs.includes(senderID);

        let arraySort = members
            .filter(u => usersInGroup.includes(u.userID))
            .map(u => ({
                name: u.name,
                count: u.count || 0,
                uid: u.userID
            }))
            .sort((a, b) => b.count - a.count)
            .map((item, index) => ({ ...item, stt: index + 1 }));

        // 🔥 GIF FUNCTION (more stable)
        const sendWithGif = async (text) => {
            try {
                const res = await axios.get("https://api.otakugifs.xyz/gif?reaction=slap");
                const imgUrl = res.data.url;

                const path = __dirname + `/cache/count_${threadID}.gif`;
                const image = await axios.get(imgUrl, { responseType: "arraybuffer" });

                fs.writeFileSync(path, Buffer.from(image.data));

                return api.sendMessage({
                    body: text,
                    attachment: fs.createReadStream(path)
                }, threadID, () => {
                    if (fs.existsSync(path)) fs.unlinkSync(path);
                });

            } catch (e) {
                return api.sendMessage(text, threadID);
            }
        };

        // 📋 MENU
        if (args[0] === "menu") {
            if (!isGroupAdmin)
                return message.reply("🚫 Only Group Admin can view this!");

            return sendWithGif(
`📋 𝐂𝐎𝐔𝐍𝐓 𝐌𝐄𝐍𝐔
━━━━━━━━━━━━━━
🔹 count / c → Your stats
🔹 count @tag → User stats
🔹 count all → Full ranking
🔹 count remove (num) → Kick inactive
━━━━━━━━━━━━━━
⚡ Powered by Hasan`
            );
        }

        // ❌ REMOVE LOW USERS
        if (args[0] === "remove") {
            if (!isGroupAdmin)
                return message.reply("🚫 Admin only command");

            const limit = parseInt(args[1]);
            if (isNaN(limit))
                return message.reply("⚠️ Example: count remove 5");

            let kickCount = 0;

            const toKick = arraySort.filter(u =>
                u.count <= limit && !adminIDs.includes(u.uid)
            );

            for (const user of toKick) {
                try {
                    await api.removeUserFromGroup(user.uid, threadID);
                    kickCount++;
                } catch {}
            }

            return sendWithGif(`✅ Removed ${kickCount} inactive members`);
        }

        // 🏆 LEADERBOARD
        if (args[0] === "all") {
            let msg = `🏆 GROUP LEADERBOARD\n━━━━━━━━━━━━━━`;

            for (const item of arraySort.slice(0, 20)) {
                msg += `\n${item.stt}. ${item.name} → ${item.count}`;
            }

            return sendWithGif(msg + `\n━━━━━━━━━━━━━━\n⚡ Hasan System`);
        }

        // 👤 USER STATS
        let targetID = senderID;

        if (type === "message_reply")
            targetID = messageReply.senderID;

        if (Object.keys(mentions).length > 0)
            targetID = Object.keys(mentions)[0];

        const findUser = arraySort.find(item => item.uid == targetID);

        if (!findUser)
            return message.reply("❌ User not found");

        return sendWithGif(
`📊 USER STATS
━━━━━━━━━━━━━━
👤 Name: ${findUser.name}
🏆 Rank: #${findUser.stt}
💬 Messages: ${findUser.count}
━━━━━━━━━━━━━━
⚡ Hasan System`
        );
    },

    // 🔄 AUTO COUNT
    onChat: async ({ usersData, threadsData, event }) => {
        const { senderID, threadID } = event;

        let members = await threadsData.get(threadID, "members") || [];

        let user = members.find(u => u.userID == senderID);

        if (!user) {
            members.push({
                userID: senderID,
                name: await usersData.getName(senderID),
                count: 1
            });
        } else {
            user.count = (user.count || 0) + 1;
        }

        await threadsData.set(threadID, members, "members");
    }
};
