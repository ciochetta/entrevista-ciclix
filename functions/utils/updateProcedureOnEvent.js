const admin = require("firebase-admin");

const { findLastMacLocation } = require("./findLastMacLocation");

const {
	updateProcedureRealTimeKpi,
	updateProcedureCleanupTimeKpi,
	updateTotalTimeProcedureKpi,
	updateOfficeToSurgeryRoomMovementTimeKpi,
	updateRestRoomToSurgeryRoomMovementTimeKpi,
	updateReturningTimeKpi,
} = require("./updateKpi");

const updateProcedureOnEvent = async function (event) {
	const db = admin.firestore();

	const procedureRef = await db.collection("procedure");

	let unfinishedProcedures = await procedureRef
		.where("status", "!=", "finished")
		.get();

	unfinishedProcedures.forEach(async (procedure) => {
		const procedureData = procedure.data();

		const isPersonInThisProcedure =
			procedureData.people.find((person) => person.mac === event.mac) !==
			undefined;

		if (isPersonInThisProcedure) {
			await handleNewEvent(procedureData, event);
		}
	});
};

const handleNewEvent = async function (procedure, event) {
	switch (procedure.status) {
		case "new":
			return await checkIfProcedureStarted(procedure, event);

		case "ongoing":
			return await checkIfProcedureEnded(procedure, event);

		case "waiting cleanup":
			return await checkIfCleanupStarted(procedure, event);

		case "cleaning":
			return await checkIfCleanupEnded(procedure, event);

		case "waiting for everyone to return":
			return await checkIfEveryoneWentBack(procedure, event);

		default:
			throw "Invalid procedure status";
	}
};

const checkIfProcedureStarted = async function (procedure, event) {
	if (event.current_location.name !== procedure.surgery_room.name) {
		return;
	}

	const eventPerson = procedure.people.find(
		(person) => person.mac === event.mac
	);

	if (eventPerson.type === "physician") {
		updateOfficeToSurgeryRoomMovementTimeKpi(event.mac);
	}

	if (eventPerson.type === "pacient") {
		updateRestRoomToSurgeryRoomMovementTimeKpi(event.mac);
	}

	let locations = [];

	await Promise.all(
		procedure.people.map(async (person) => {
			if (person.type === "cleaning") {
				return null;
			}

			const location = await findLastMacLocation(person.mac);

			locations.push(location);

			if (location === null || location.name !== procedure.surgery_room.name) {
				console.log(
					`Procedure ${procedure.id} is Waiting for ${person.name} to arrive  | mac: ${person.mac}`
				);
			}

			return location;
		})
	);

	const isEveryoneHere =
		locations.filter(
			(location) =>
				location === null || location.name !== procedure.surgery_room.name
		).length === 0;

	if (isEveryoneHere) {
		console.log(`Procedure ${procedure.id} is starting`);
		const db = admin.firestore();

		const procedureRef = await db.collection("procedure");

		await procedureRef.doc(procedure.id).update({
			status: "ongoing",
			procedure_started_at: new Date(),
		});
	}
};

const checkIfProcedureEnded = async function (procedure, event) {
	let locations = [];

	await Promise.all(
		procedure.people.map(async (person) => {
			if (person.type === "cleaning") {
				return null;
			}

			const location = await findLastMacLocation(person.mac);

			locations.push(location);

			return location;
		})
	);

	isAnyoneHere =
		locations.find(
			(location) => location.name === procedure.surgery_room.name
		) !== undefined;

	if (isAnyoneHere) {
		return;
	}

	const db = admin.firestore();

	const procedureRef = await db.collection("procedure");

	let procedure_ended_at = new Date();

	await procedureRef.doc(procedure.id).update({
		status: "waiting cleanup",
		procedure_ended_at: procedure_ended_at,
	});

	await updateProcedureRealTimeKpi(procedure.id);
};

const checkIfCleanupStarted = async function (procedure, event) {
	const eventPerson = procedure.people.find(
		(person) => person.mac === event.mac
	);

	if (
		eventPerson.type !== "cleaning" ||
		event.current_location.name !== procedure.surgery_room.name
	) {
		return;
	}

	const db = admin.firestore();

	const procedureRef = await db.collection("procedure");

	await procedureRef.doc(procedure.id).update({
		status: "cleaning",
		cleaning_started_at: new Date(),
	});
};

const checkIfCleanupEnded = async function (procedure, event) {
	const eventPerson = procedure.people.find(
		(person) => person.mac === event.mac
	);

	if (eventPerson.type !== "cleaning") {
		return;
	}

	if (event.current_location.name !== procedure.surgery_room.name) {
		const db = admin.firestore();

		const procedureRef = await db.collection("procedure");

		await procedureRef.doc(procedure.id).update({
			status: "waiting for everyone to return",
			cleaning_ended_at: new Date(),
			waiting: procedure.people.filter((person) => person.mac !== event.mac),
		});

		await updateProcedureCleanupTimeKpi(procedure.id);
		await updateTotalTimeProcedureKpi(procedure.id);

		await checkIfEveryoneWentBack(procedure, event);
	}
};

const checkIfEveryoneWentBack = async function (procedure, event) {
	const db = admin.firestore();

	const eventsRef = db.collection("events");
	const procedureRef = db.collection("procedure");

	const everyoneWentSomewhereElseAfterProcedure = await Promise.all(
		procedure.people.map(async (person) => {
			if (
				procedure.waiting !== undefined &&
				procedure.waiting.find((p) => p.mac === person.mac) === undefined
			) {
				return true;
			}

			const locationType = getLocationTypeByPersonType(person.type);

			const arrivedQuery = await eventsRef
				.where("mac", "==", person.mac)
				.where("current_location.type", "==", locationType)
				.where("date", ">", procedure.procedure_ended_at)
				.orderBy("date", "desc")
				.get();

			//console.log(person, arrivedQuery);

			if (arrivedQuery.size !== 0) {
				await updateReturningTimeKpi(
					person.mac,
					procedure.id,
					arrivedQuery.docs[0].data().date
				);
			}

			return arrivedQuery.size !== 0;
		})
	);

	if (everyoneWentSomewhereElseAfterProcedure.every((a) => a)) {
		await procedureRef.doc(procedure.id).update({
			status: "finished",
			everyone_returned_at: new Date(),
		});
	}
};

const getLocationTypeByPersonType = function (personType) {
	if (personType === "pacient") {
		return "resting_room";
	}

	if (personType === "physician") {
		return "office";
	}

	if (personType === "cleaning") {
		return "corridor";
	}
};

module.exports = { updateProcedureOnEvent };
