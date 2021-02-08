const admin = require("firebase-admin");

const {
	getRawPeopleArrayFromProcedureArray,
} = require("./getRawPeopleArrayFromProcedureArray");

const getPeopleFromRawProcedureArray = async function (rawProcedureArray) {
	const db = admin.firestore();

	const peopleRef = await db.collection("people");

	const rawPeopleArray = getRawPeopleArrayFromProcedureArray(rawProcedureArray);

	let dbPeopleArray = [];

	for (let i = 0; i < rawPeopleArray.length; i++) {
		const dbPerson = await findOrInsert(peopleRef, rawPeopleArray[i]);

		dbPeopleArray.push(dbPerson);
	}

	return dbPeopleArray;
};

const findOrInsert = async function (peopleRef, person) {
	let dbData = await peopleRef.doc(person.mac).get();

	if (dbData.exists) {
		return dbData.data();
	} else {
		await peopleRef.doc(person.mac).set(person);

		return await findOrInsert(peopleRef, person);
	}
};

module.exports = {
	getPeopleFromRawProcedureArray,
};
