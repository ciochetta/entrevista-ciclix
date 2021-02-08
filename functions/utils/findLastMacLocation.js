const admin = require("firebase-admin");

const findLastMacLocation = async function (mac) {
	const db = admin.firestore();

	const eventsRef = await db.collection("events");

	const query = await eventsRef
		.where("mac", "==", mac)
		.orderBy("date", "desc")
		.limit(1)
		.get();

	if (query.size === 0) {
		return null;
	}

	return query.docs[0].data().current_location;
};

module.exports = { findLastMacLocation };
