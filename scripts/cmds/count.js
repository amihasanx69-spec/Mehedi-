const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
    config: {
        name: "count",
        version: "4.0.0",
        author: "Mr.King",
        countDown: 5,
        role: 0,
        aliases: ["c"],
        category: "box chat"
    },

    onStart: async function ({ args, threadsData, message, event, api }) {
        const { threadID, senderID, messageReply, type, mentions } = event;
        const threadData = await threadsData.get(threadID);
        const { members, adminIDs } = threadData;
        const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
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

        // এনিমে ফাইটিং জিআইএফ ফাংশন
        const sendWithGif = async (text) => {
            try {
                const res = await axios.get("https://api.otakugifs.xyz/gif?reaction=punch"); // ফাইটিং রিয়েকশন
                const imgUrl = res.data.url;
                const path = __dirname + `/cache/fight_${threadID}.gif`;
                const imageRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(path, Buffer.from(imageRes.data, "utf-8"));
                
                return api.sendMessage({
                    body: text,
                    attachment: fs.createReadStream(path)
                }, threadID, () => { if (fs.existsSync(path)) fs.unlinkSync(path); });
            } catch (err) {
                return api.sendMessage(text, threadID);
            }
        };

        // ১. হেল্প মেনু
        if (args[0] === "menu") {
            if (!isGroupAdmin) return message.reply("🚫 𝐎𝐧𝐥𝐲 𝐆𝐫𝐨𝐮𝐩 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐯𝐢𝐞𝐰 𝐭𝐡𝐢𝐬 𝐦𝐞𝐧𝐮");
            const menuMsg = `📋 ( 𝐂𝐨𝐮𝐧𝐭 𝐌𝐚𝐧𝐮𝐚𝐥 )\n━━━━━━━━━━━━━━━━━━\n🔹 𝐜𝐨𝐮𝐧𝐭 / 𝐜 -> 𝐘𝐨𝐮𝐫 𝐬𝐭𝐚𝐭𝐬\n🔹 𝐜𝐨𝐮𝐧𝐭 (𝐫𝐞𝐩𝐥𝐲) -> 𝐔𝐬𝐞𝐫 𝐬𝐭𝐚𝐭𝐬\n🔹 𝐜𝐨𝐮𝐧𝐭 𝐚𝐥𝐥 -> 𝐅𝐮𝐥𝐥 𝐫𝐚𝐧𝐤𝐢𝐧𝐠\n🔹 𝐜𝐨𝐮𝐧𝐭 𝐫𝐞𝐦𝐨𝐯𝐞 (𝐧𝐮𝐦) -> 𝐊𝐢𝐜𝐤 𝐥𝐨𝐰 𝐦𝐬𝐠 𝐮𝐬𝐞𝐫𝐬\n━━━━━━━━━━━━━━━━━━\n•🐉`;
            return sendWithGif(menuMsg);
        }

        // ২. রিমুভ সিস্টেম
        if (args[0] === "remove") {
            if (!isGroupAdmin) return message.reply("🚫 𝐎𝐧𝐥𝐲 𝐆𝐫𝐨𝐮𝐩 𝐀𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬");
            const limit = parseInt(args[1]);
            if (isNaN(limit)) return message.reply("⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 (𝐞.𝐠: 𝐜𝐨𝐮𝐧𝐭 𝐫𝐞𝐦𝐨𝐯𝐞 𝟓)");

            let kickCount = 0;
            const toKick = arraySort.filter(u => u.count <= limit && !adminIDs.includes(u.uid));

            for (const user of toKick) {
                await api.removeUserFromGroup(user.uid, threadID);
                kickCount++;
            }
            return sendWithGif(`✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 ${kickCount} 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐰𝐢𝐭𝐡 𝐥𝐞𝐬𝐬 𝐭𝐡𝐚𝐧 ${limit} 𝐦𝐞𝐬𝐬𝐚𝐠𝐞𝐬`);
        }

        // ৩. অল মেম্বার লিস্ট
        if (args[0] === "all") {
            let msg = `🏆 ( 𝐆𝐫𝐨𝐮𝐩 𝐋𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝 )\n━━━━━━━━━━━━━━━━━━`;
            for (const item of arraySort) {
                msg += `\n${item.stt}. ${item.name}: ${item.count}`;
            }
            return sendWithGif(msg + `\n━━━━━━━━━━━━━━━━━━\n• 𝐌𝐫.𝐊𝐢𝐧𝐠 𝐒𝐲𝐬𝐭𝐞𝐦🐉`);
        }

        // ৪. স্ট্যাটাস চেক
        let targetID = type === "message_reply" ? messageReply.senderID : senderID;
        if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

        const findUser = arraySort.find(item => item.uid == targetID);
        if (!findUser) return message.reply("❌ 𝐔𝐬𝐞𝐫 𝐝𝐚𝐭𝐚 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!");

        const title = targetID == senderID ? "𝐘𝐨𝐮𝐫 𝐒𝐭𝐚𝐭𝐬" : "𝐔𝐬𝐞𝐫 𝐒𝐭𝐚𝐭𝐬";
        const statsMsg = `📊 ( ${title} )\n━━━━━━━━━━━━━━━━━━\n👤 | 𝐍𝐚𝐦𝐞: ${findUser.name}\n👑 | 𝐑𝐚𝐧𝐤: #${findUser.stt}\n💬 | 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${findUser.count}\n━━━━━━━━━━━━━━━━━━\n• 🐉`;
        return sendWithGif(statsMsg);
    },

    onChat: async ({ usersData, threadsData, event }) => {
        const { senderID, threadID } = event;
        let members = await threadsData.get(threadID, "members") || [];
        const findMember = members.find(user => user.userID == senderID);
        if (!findMember) {
            members.push({ userID: senderID, name: await usersData.getName(senderID), count: 1 });
        } else {
            findMember.count = (findMember.count || 0) + 1;
        }
        await threadsData.set(threadID, members, "members");
    }
};
