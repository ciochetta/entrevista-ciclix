const getRawPeopleArrayFromProcedureArray = function (rawProcedureArray) {
	let staffObjectArrayArray = rawProcedureArray.map(
		getPhysicianObjectArrayFromProcedure
	);

	return [
		...rawProcedureArray.map(getPatientObjectFromProcedure),
		...staffObjectArrayArray.flat(1),
		...rawProcedureArray.map(getCleaningStaffFromProcedure),
	];
};

const getPeopleArrayFromProcedure = function (rawProcedure) {
	const staffArray = getPhysicianObjectArrayFromProcedure(rawProcedure);

	return [
		getPatientObjectFromProcedure(rawProcedure),
		...staffArray,
		getCleaningStaffFromProcedure(rawProcedure),
	];
};

const getPatientObjectFromProcedure = function (rawProcedure) {
	return {
		name: rawProcedure.patient,
		mac: rawProcedure.patient_mac,
		type: "pacient",
	};
};

const getPhysicianObjectArrayFromProcedure = function (rawProcedure) {
	return rawProcedure.staff.map((staff) => {
		return {
			name: staff.physician_name,
			mac: staff.physician_mac,
			type: "physician",
		};
	});
};

const getCleaningStaffFromProcedure = function (rawProcedure) {
	return {
		name: rawProcedure.cleaning_staff,
		mac: rawProcedure.cleaning_staff_mac,
		type: "cleaning",
	};
};

module.exports = {
	getRawPeopleArrayFromProcedureArray,
	getPeopleArrayFromProcedure,
};
