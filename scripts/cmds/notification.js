const { getStreamsFromAttachment } = global.utils;

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "2.1",
		author: "Asraful Islam",
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
			delayPerGroup: 500
		}
	},

	langs: {
		en: {
			missingMessage: "⚠ Please enter a message or reply to media",
			notification: "📢 NOTIFICATION আজরাইল ",
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

		const { delayPerGroup } = envCommands[commandName];

		if (!args[0] && !event.messageReply)
			return message.reply(getLang("missingMessage"));

		// Collect attachments
		const attachments = [
			...event.attachments,
			...(event.messageReply?.attachments || [])
		].filter(item =>
			["photo", "png", "animated_image", "video", "audio"].includes(item.type)
		);

		// All group list
		const allThreadID = (await threadsData.getAll())
			.filter(thread =>
				thread.isGroup &&
				thread.members.some(
					member =>
						member.userID == api.getCurrentUserID() &&
						member.inGroup
				)
			);

		message.reply(
			getLang("sendingNotification", allThreadID.length)
		);

		let success = 0;
		let failed = [];

		for (const thread of allThreadID) {
			try {

				// IMPORTANT: regenerate stream every loop
				const formSend = {
					body:
`${getLang("notification")}
━━━━━━━━━━━━━━━━━━

${args.join(" ") || "No message"}

━━━━━━━━━━━━━━━━━━
🤖 Owner: Hasan`
				};

				// Add attachment if exists
				if (attachments.length > 0) {
					formSend.attachment =
						await getStreamsFromAttachment(attachments);
				}

				await api.sendMessage(
					formSend,
					thread.threadID
				);

				success++;

				await new Promise(resolve =>
					setTimeout(resolve, delayPerGroup)
				);

			}
			catch (err) {
				console.log(err);
				failed.push(thread.threadID);
			}
		}

		let finalMsg =
`📡 Notification Complete

✅ Success: ${success}
❌ Failed: ${failed.length}`;

		if (failed.length > 0) {
			finalMsg += `\n\nFailed Groups:\n${failed.join("\n")}`;
		}

		message.reply(finalMsg);
	}
};
