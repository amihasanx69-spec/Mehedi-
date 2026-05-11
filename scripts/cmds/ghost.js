const fs = require("fs-extra");
const path = __dirname + "/cache/unsendData.json";

module.exports = {
	config: {
		name: "ghost",
		version: "7.0.0",
		author: "Hasan X Fix",
		category: "system"
	},

	onLoad: () => {
		if (!fs.existsSync(path)) fs.writeJsonSync(path, {});
	},

	onChat: async ({ event, api, usersData }) => {
		const { threadID, messageID, senderID, type, body, attachments } = event;

		let unsendData = {};
		if (fs.existsSync(path)) unsendData = fs.readJsonSync(path);

		// Save message
		if (type === "message" || type === "message_reply") {
			if (!unsendData[threadID]) {
				unsendData[threadID] = { status: true, messages: {} };
			}

			unsendData[threadID].messages[messageID] = {
				senderID,
				body: body || "📎 Attachment",
				time: new Date().toLocaleString(),
				attachments: attachments?.map(att => att.url) || []
			};

			fs.writeJsonSync(path, unsendData);
		}

		// Handle unsend
		if (type === "message_unsend") {
			if (!unsendData[threadID] || !unsendData[threadID].status) return;

			const info = unsendData[threadID].messages[event.messageID];
			if (!info) return;

			// Ignore bot unsend
			if (info.senderID == api.getCurrentUserID()) return;

			const userName = await usersData.getName(info.senderID);

			let msg = `
⚠️ UNSEND ALERT ⚠️

😈 Name: ${userName}
🕒 Time: ${info.time}

🗑️ Deleted Message:
${info.body}
`;

			if (info.attachments.length > 0) {
				await api.sendMessage({
					body: msg,
					attachment: await Promise.all(
						info.attachments.map(url => global.utils.getStreamFromURL(url))
					)
				}, threadID);
			} else {
				api.sendMessage(msg, threadID);
			}

			// React
			api.setMessageReaction("😈", event.messageID, () => {}, true);

			// Delete from file
			delete unsendData[threadID].messages[event.messageID];
			fs.writeJsonSync(path, unsendData);
		}
	},

	onStart: async ({ api, event, args }) => {
		const { threadID } = event;

		let unsendData = {};
		if (fs.existsSync(path)) unsendData = fs.readJsonSync(path);

		if (!unsendData[threadID]) {
			unsendData[threadID] = { status: true, messages: {} };
		}

		if (args[0] === "off") {
			unsendData[threadID].status = false;
			fs.writeJsonSync(path, unsendData);
			return api.sendMessage("❌ Ghost OFF", threadID);
		}

		if (args[0] === "on") {
			unsendData[threadID].status = true;
			fs.writeJsonSync(path, unsendData);
			return api.sendMessage("✅ Ghost ON", threadID);
		}

		return api.sendMessage(
			"👻 Ghost System\n\nUse:\nghost on\nghost off",
			threadID
		);
	}
};
