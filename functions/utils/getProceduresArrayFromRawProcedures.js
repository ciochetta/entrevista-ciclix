const admin = require("firebase-admin");

const {
	getPeopleArrayFromProcedure,
} = require("./getRawPeopleArrayFromProcedureArray");

const { getLocationObjectFromName } = require("./getLocationObjectFromName");

const getProceduresArrayFromRawProcedures = async function (rawProcedureArray) {
	const db = admin.firestore();

	const procedureRef = await db.collection("procedure");

	const procedureArray = rawProcedureArray.map((rawProcedure) => {
		return {
			id: rawProcedure.id,
			protocol: rawProcedure.protocol,
			procedure: rawProcedure.procedure,
			surgery_room: getLocationObjectFromName(rawProcedure.surgery_room),
			schedule: scheduleToTimeStamp(rawProcedure.schedule),
			estimated_surgery_time: rawProcedure.estimated_surgery_time,
			people: getPeopleMacFromProcedure(rawProcedure),
			status: "new",
			real_surgery_time: null,
		};
	});

	const dbProcedureArray = [];

	for (let i = 0; i < procedureArray.length; i++) {
		const dbProcedure = await findOrInsert(procedureRef, procedureArray[i]);

		dbProcedureArray.push(dbProcedure);
	}

	return dbProcedureArray;
};

const findOrInsert = async function (procedureRef, procedure) {
	let dbData = await procedureRef.doc(procedure.id).get();

	if (dbData.exists) {
		return dbData.data();
	} else {
		await procedureRef.doc(procedure.id).set(procedure);

		return await findOrInsert(procedureRef, procedure);
	}
};

const scheduleToTimeStamp = function (schedule) {
	let time = new Date();

	let arr = schedule.split(":");

	time.setHours(arr[0], arr[1], arr[2], 0);

	return time;
};

const getPeopleMacFromProcedure = function (rawProcedure) {
	const peopleArray = getPeopleArrayFromProcedure(rawProcedure);

	return peopleArray;
};

module.exports = { getProceduresArrayFromRawProcedures };
