const admin = require("firebase-admin");

const updateProcedureRealTimeKpi = async function (id) {
	const db = admin.firestore();

	const procedureRef = await db.collection("procedure");
	const kpisRef = await db.collection("kpis");

	const procedureQuery = await procedureRef.doc(id).get();

	if (!procedureQuery.exists) {
		throw "Invalid procedure";
	}

	const procedure = procedureQuery.data();

	const kpiObject = {
		amount: 1,
		time:
			procedure.procedure_ended_at.seconds -
			procedure.procedure_started_at.seconds,
		metric: "real_time",
		procedure: procedure.procedure,
	};

	await updateOrInsertProcedureKpi(kpisRef, kpiObject);
};

const updateProcedureCleanupTimeKpi = async function (id) {
	const db = admin.firestore();

	const procedureRef = await db.collection("procedure");
	const kpisRef = await db.collection("kpis");

	const procedureQuery = await procedureRef.doc(id).get();

	if (!procedureQuery.exists) {
		throw "Invalid procedure";
	}

	const procedure = procedureQuery.data();

	const kpiObject = {
		amount: 1,
		time:
			procedure.cleaning_ended_at.seconds -
			procedure.cleaning_started_at.seconds,
		metric: "cleaning_time",
		procedure: procedure.procedure,
	};

	await updateOrInsertProcedureKpi(kpisRef, kpiObject);
};

const updateTotalTimeProcedureKpi = async function (id) {
	const db = admin.firestore();

	const procedureRef = await db.collection("procedure");
	const kpisRef = await db.collection("kpis");

	const procedureQuery = await procedureRef.doc(id).get();

	if (!procedureQuery.exists) {
		throw "Invalid procedure";
	}

	const procedure = procedureQuery.data();

	const kpiObject = {
		amount: 1,
		time:
			procedure.cleaning_ended_at.seconds -
			procedure.procedure_started_at.seconds,
		metric: "total_time",
		procedure: procedure.procedure,
	};

	await updateOrInsertProcedureKpi(kpisRef, kpiObject);
};

const updateOrInsertProcedureKpi = async function (kpiRef, kpi) {
	const kpiName = `procedure_${kpi.procedure}_${kpi.metric}`;

	const kpiQuery = await kpiRef.doc(kpiName).get();

	if (kpiQuery.exists) {
		const dbKpi = kpiQuery.data();

		kpiRef.doc(kpiName).update({
			amount: dbKpi.amount + kpi.amount,
			time: dbKpi.time + kpi.time,
		});
	} else {
		await kpiRef.doc(kpiName).set(kpi);
	}
};

const updateOfficeToSurgeryRoomMovementTimeKpi = async function (mac) {
	const db = admin.firestore();

	const eventsRef = await db.collection("events");

	const arrivedQuery = await eventsRef
		.where("mac", "==", mac)
		.where("current_location.type", "==", "surgery_room")
		.orderBy("date", "desc")
		.limit(1)
		.get();

	if (arrivedQuery.size === 0) {
		return;
	}

	const arrivedEvent = arrivedQuery.docs[0].data();

	const leftQuery = await eventsRef
		.where("mac", "==", mac)
		.where("current_location.type", "==", "office")
		.orderBy("date", "desc")
		.limit(1)
		.get();

	if (leftQuery.size === 0) {
		return;
	}

	const leftEvent = leftQuery.docs[0].data();

	const movementTime = arrivedEvent.date.seconds - leftEvent.date.seconds;

	const kpisRef = await db.collection("kpis");

	const kpiObject = {
		amount: 1,
		time: movementTime,
		metric: "office_to_surgery_room",
	};

	await updateOrInsertMovementKpi(kpisRef, kpiObject);
};

const updateRestRoomToSurgeryRoomMovementTimeKpi = async function (mac) {
	const db = admin.firestore();

	const eventsRef = await db.collection("events");

	const arrivedQuery = await eventsRef
		.where("mac", "==", mac)
		.where("current_location.type", "==", "surgery_room")
		.orderBy("date", "desc")
		.limit(1)
		.get();

	if (arrivedQuery.size === 0) {
		return;
	}

	const arrivedEvent = arrivedQuery.docs[0].data();

	const leftQuery = await eventsRef
		.where("mac", "==", mac)
		.where("current_location.type", "==", "resting_room")
		.orderBy("date", "desc")
		.limit(1)
		.get();

	if (leftQuery.size === 0) {
		return;
	}

	const leftEvent = leftQuery.docs[0].data();

	const movementTime = arrivedEvent.date.seconds - leftEvent.date.seconds;

	const kpisRef = await db.collection("kpis");

	const kpiObject = {
		amount: 1,
		time: movementTime,
		metric: "resting_room_to_surgery_room",
	};

	await updateOrInsertMovementKpi(kpisRef, kpiObject);
};

const updateOrInsertMovementKpi = async function (kpiRef, kpi) {
	const kpiName = `movement_${kpi.metric}`;

	const kpiQuery = await kpiRef.doc(kpiName).get();

	if (kpiQuery.exists) {
		const dbKpi = kpiQuery.data();

		kpiRef.doc(kpiName).update({
			amount: dbKpi.amount + kpi.amount,
			time: dbKpi.time + kpi.time,
		});
	} else {
		await kpiRef.doc(kpiName).set(kpi);
	}
};

const updateReturningTimeKpi = async function (
	personMac,
	procedureId,
	arriveTimestamp
) {
	const db = admin.firestore();

	const kpisRef = await db.collection("kpis");
	const procedureRef = await db.collection("procedure");

	getProcedureQuery = await procedureRef.doc(procedureId).get();

	if (getProcedureQuery.exists) {
		return;
	}

	const dbProcedure = getProcedureQuery.data();

	const personType = dbProcedure.people
		.find(person.mac === personMac)
		.type.toString();

	let waiting = dbProcedure.waiting;

	waiting = waiting.filter((mac) => mac !== personMac);

	await procedureRef.doc(procedureId).update({
		waiting: waiting,
	});

	const returnTime =
		arriveTimestamp -
		(personType === "cleaning"
			? dbProcedure.cleaning_ended_at
			: dbProcedure.cleaning_ended_at);

	const kpiObject = {
		amount: 1,
		time: returnTime,
		metric: `${personType}_return_time`,
	};

	const kpiName = `${kpiObject.metric}`;

	const kpiQuery = await kpisRef.doc(kpiName).get();

	if (kpiQuery.exists) {
		const dbKpi = kpiQuery.data();

		kpisRef.doc(kpiName).update({
			amount: dbKpi.amount + kpiQuery.amount,
			time: dbKpi.time + kpiQuery.time,
		});
	} else {
		await kpisRef.doc(kpiName).set(kpiObject);
	}
};

module.exports = {
	updateProcedureRealTimeKpi,
	updateProcedureCleanupTimeKpi,
	updateTotalTimeProcedureKpi,
	updateOfficeToSurgeryRoomMovementTimeKpi,
	updateRestRoomToSurgeryRoomMovementTimeKpi,
	updateReturningTimeKpi,
};
