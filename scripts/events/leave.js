const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.1",
		author: "NTKhang + Hasan",
		category: "events"
	},

	langs: {
		en: {
			session1: "Morning",
			session2: "Noon",
			session3: "Afternoon",
			session4: "Evening"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {

		// শুধু leave/kick event detect
		if (event.logMessageType !== "log:unsubscribe")
			return;

		try {

			const { threadID, author } = event;

			const threadData = await threadsData.get(threadID);

			if (!threadData.settings.sendLeaveMessage)
				return;

			const { leftParticipantFbId } = event.logMessageData;

			// Bot নিজে leave করলে skip
			if (leftParticipantFbId == api.getCurrentUserID())
				return;

			const userName = await usersData.getName(leftParticipantFbId) || "Unknown User";
			const threadName = threadData.threadName || "Unknown Group";

			const hours = getTime("HH");
			const minutes = getTime("mm");

			const session =
				hours <= 10 ? getLang("session1") :
				hours <= 12 ? getLang("session2") :
				hours <= 18 ? getLang("session3") :
				getLang("session4");

			// Leave messages
			const leaveMessages = [
				`😢 ${userName} গ্রুপ ছেড়ে পালাইছে... WiFi বিল দিতে পারে নাই মনে হয় 😭`,
				`💔 ${userName} চলে গেছে! এখন group-এর cringe level একটু কমলো 😹`,
				`🚶 ${userName} লিফট নিছে... মনে হয় প্রেমে ধোঁকা খাইছে 😭💔`,
				`🥺 ${userName} আর থাকতে পারলো না... admin-এর ভয় পাইছে বোধহয় 👀`,
				`📤 ${userName} group leave দিছে! FBI নাকি খুঁজতেছিল 😶`,
				`😓 ${userName} চলে গেছে... এখন কে রাতে "Hi" দিবে 😭`,
				`👋 Bye Bye ${userName}, group-এর biryani খাইয়া পালাইছো নাকি? 🍗`,
				`💀 ${userName} group থেকে vanish হয়ে গেছে... Doctor Strange confirm 😹`,
				`🤧 ${userName} leave নিছে... এখন group এ আর free fire fight হবে না 🔥`,
				`🐸 ${userName} পালাইছে! মনে হয় exam result বের হইছে 📄`
			];

			// Kick messages
			const kickMessages = [
				`🚫 ${userName} কে group থেকে kick মারা হয়েছে 😹`,
				`⚡ Admin রাগ করে ${userName} কে বের করে দিল 👀`,
				`💀 ${userName} kicked out! Too much attitude detected 😶`,
				`🔨 ${userName} আর এই group-এ থাকার যোগ্য না 😹`,
				`❌ ${userName} কে লাথি মেরে group থেকে বের করা হয়েছে 😂`,
				`😵 ${userName} এখন officially homeless in Messenger 😭`,
				`🚷 ${userName} banned from the group area 🚫`,
				`🪦 ${userName} এর group life এখানেই শেষ 😹`
			];

			// FIXED DETECTION
			const isKick = String(leftParticipantFbId) !== String(author);

			const randomMessage = isKick
				? kickMessages[Math.floor(Math.random() * kickMessages.length)]
				: leaveMessages[Math.floor(Math.random() * leaveMessages.length)];

			const msg = `
╭━━━〔 👋 GROUP UPDATE 〕━━━╮

🧑 Name: ${userName}
📌 Group: ${threadName}
🕒 Time: ${hours}:${minutes}
🌤️ Session: ${session}
📍 Status: ${isKick ? "Kicked Out 🚫" : "Left Group 👋"}

━━━━━━━━━━━━━━━━━━

${randomMessage}

╰━━━━━━━━━━━━━━━━━━╯
`;

			const form = {
				body: msg,
				mentions: [{
					tag: userName,
					id: leftParticipantFbId
				}]
			};

			// Attachment support
			if (threadData.data.leaveAttachment) {

				const files = threadData.data.leaveAttachment;

				const attachments = await Promise.allSettled(
					files.map(file => drive.getFile(file, "stream"))
				);

				form.attachment = attachments
					.filter(item => item.status === "fulfilled")
					.map(item => item.value);
			}

			await message.send(form);

		} catch (err) {
			console.log("Leave Event Error:", err);
		}
	}
};
