const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.0",
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

		if (event.logMessageType == "log:unsubscribe")
			return async function () {

				const { threadID } = event;

				const threadData = await threadsData.get(threadID);

				if (!threadData.settings.sendLeaveMessage)
					return;

				const { leftParticipantFbId } = event.logMessageData;

				if (leftParticipantFbId == api.getCurrentUserID())
					return;

				const userName = await usersData.getName(leftParticipantFbId);
				const threadName = threadData.threadName || "Unknown Group";

				const hours = getTime("HH");
				const minutes = getTime("mm");

				const session =
					hours <= 10 ? getLang("session1") :
					hours <= 12 ? getLang("session2") :
					hours <= 18 ? getLang("session3") :
					getLang("session4");

				// User নিজে leave দিলে
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
					`🐸 ${userName} পালাইছে! মনে হয় exam result বের হইছে 📄`,
					`🫠 ${userName} আর সহ্য করতে পারে নাই এই group-এর মানুষজন 😭`,
					`😂 ${userName} group leave দিলো... কিন্তু screenshots রয়ে গেছে 👀`,
					`🚫 ${userName} offline হয়ে real life try করতে গেছে 😹`,
					`😹 ${userName} গেছে, এখন admin শান্তিতে ঘুমাবে 💤`,
					`🥲 ${userName} leave নিছে... এখন meme এ react দিবে কে?`
				];

				// Kick করলে
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

				// Left নাকি Kick detect
				const isLeft = leftParticipantFbId == event.author;

				const randomMessage = isLeft
					? leaveMessages[Math.floor(Math.random() * leaveMessages.length)]
					: kickMessages[Math.floor(Math.random() * kickMessages.length)];

				const msg = `
╭━━━〔 👋 GROUP LEAVE 〕━━━╮

🧑 Name: ${userName}
📌 Group: ${threadName}
🕒 Time: ${hours}:${minutes}
🌤️ Session: ${session}

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

					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);

					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}

				message.send(form);
			};
	}
};
