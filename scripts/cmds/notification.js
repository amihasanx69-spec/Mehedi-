const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "3.0",
		author: "Asraful Islam + ChatGPT Fix",
		countDown: 5,
		role: 2,
		description: {
			en: "Send notification to all groups"
		},
		category: "owner",
		guide: {
			en: "{pn} <message>\nReply photo/video/audio to send attachment"
		},
		envConfig: {
			delayPerGroup: 1000
		}
	},

	langs: {
		en: {
			missingMessage: "⚠️ Please enter a message or reply to media",
			notification: "📢 NOTIFICATION",
			sendingNotification: "⏳ Sending notification to %1 groups...",
			sentNotification: "✅ Successfully sent to %1 groups",
			errorSendingNotification: "❌ Failed to send to %1 groups"
		}
	},

	onStart: async function ({
		message,
		api,
		event,
		args,
		commandName,
		envCommands,
		threadsData,
		getLang
	}) {

		try {

			const { delayPerGroup } = envCommands[commandName];

			if (!args[0] && !event.messageReply)
				return message.reply(getLang("missingMessage"));

			// Get valid attachments
			const attachments = [];

			if (event.attachments?.length > 0) {
				attachments.push(...event.attachments);
			}

			if (event.messageReply?.attachments?.length > 0) {
				attachments.push(...event.messageReply.attachments);
			}

			const validAttachments = attachments.filter(item =>
				["photo", "animated_image", "video", "audio"].includes(item.type)
			);

			// Get all groups
			const allThreads = await threadsData.getAll();

			const groupList = allThreads.filter(thread =>
				thread.isGroup &&
				Array.isArray(thread.members) &&
				thread.members.some(
					member =>
						member.userID == api.getCurrentUserID() &&
						member.inGroup
				)
			);

			if (groupList.length === 0) {
				return message.reply("❌ No group found");
			}

			await message.reply(
				getLang("sendingNotification", groupList.length)
			);

			let success = 0;
			const failed = [];

			for (const thread of groupList) {
				try {

					const formSend = {
						body:
`${getLang("notification")}
━━━━━━━━━━━━━━━━━━

${args.join(" ") || "No message"}

━━━━━━━━━━━━━━━━━━
🤖 Owner: Hasan`
					};

					// FIX attachment stream
					if (validAttachments.length > 0) {
						try {
							formSend.attachment =
								await getStreamsFromAttachment(validAttachments);
						}
						catch (e) {
							console.log("Attachment Error:", e);
						}
					}

					await api.sendMessage(
						formSend,
						thread.threadID
					);

					success++;

				}
				catch (err) {
					console.log(
						`Failed Group ${thread.threadID}:`,
						err.message
					);

					failed.push(thread.threadID);
				}

				// Delay to avoid spam block
				await new Promise(resolve =>
					setTimeout(resolve, delayPerGroup)
				);
			}

			let finalMsg =
`📡 Notification Complete

✅ Sent: ${success}
❌ Failed: ${failed.length}`;

			if (failed.length > 0) {
				finalMsg += `\n\n❌ Failed IDs:\n${failed.join("\n")}`;
			}

			return message.reply(finalMsg);

		}
		catch (error) {
			console.log(error);
			return message.reply(
				"❌ Notification command crashed:\n" + error.message
			);
		}
	}
};
