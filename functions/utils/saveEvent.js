const admin = require("firebase-admin");

const { updateProcedureOnEvent } = require("./updateProcedureOnEvent");

const { getLocationObjectFromName } = require("./getLocationObjectFromName");

const saveEvent = async function (event) {
	const db = admin.firestore();

	const eventsRef = await db.collection("events");

	event.date = new Date();

	event.current_location = getLocationObjectFromName(event.current_location);

	await eventsRef.add(event);

	await updateProcedureOnEvent(event);
};

module.exports = { saveEvent };
