module.exports = {
	config: {
		name: "all",
		version: "5.0",
		author: "ShAn + Hasan",
		countDown: 5,
		role: 0,
		description: {
			en: "Tag all members with funny messages (clean version)"
		},
		category: "BOX CHAT",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message, event, api, args }) {

		const { participantIDs } = event;

		const funnyMessages = [
			"🚨 সবাই চিপা থেকে বের হও\n🔥 নাইলে চিপায় আগুন দিমু!",
			"🐸 এই যে লুকাইয়া থাকা মানুষজন\n⚡ বের হও নাইলে tag spam শুরু করুম!",
			"😹 যারা mute মাইরা ঘুমাইতেছো\n📢 তাদের আজকে জাগানো হবে!",
			"🚑 সবাই online হও তাড়াতাড়ি\n💀 group এ emergency meme drop হইছে!",
			"👀 ghost রা বের হও\n🪦 না হলে exorcist ডাকমু!",
			"😂 seen দিয়ে পালায়ো না\n🔪 আজকে reply না দিলে বিচার হবে!",
			"📢 সবাই কোথায় গেলি?\n☠️ group এ মানুষ কম zombie বেশি!",
			"🔥 যারা inactive আছো\n😈 তাদের data pack জব্দ করা হবে!",
			"🐒 এই group এ এত চুপচাপ কেন?\n💣 WiFi এ লাথি মারুম কিন্তু!",
			"😑 সবাই attendance দাও\n📛 না দিলে absent মাইরা দিমু!",
			"🚨 লুকাইয়া থাকা members রা বের হও\n🩴 admin sandal নিয়ে আসতেছে!",
			"🤣 reply না দিলে ধরে নিবো\n💔 তোমরা সবাই প্রেম করতেছো!",
			"⚡ group এ আসো সবাই\n🍿 আজকে ঝগড়া live হবে!",
			"🗿 mute কইরা রাখছো নাকি?\n📢 notification ফাটাইয়া দিমু কিন্তু!",
			"😹 সবাই online হও\n🔥 না হলে group এ ভূত ছাড়মু!"
		];

		let body = args.join(" ");

		if (!body)
			body = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

		const mentions = [];

		for (const uid of participantIDs) {
			if (uid == api.getCurrentUserID()) continue;

			mentions.push({
				tag: "‎", // invisible tag (no @ spam)
				id: uid
			});
		}

		return message.reply({
			body,
			mentions
		});
	}
};
