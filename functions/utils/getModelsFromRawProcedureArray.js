const {
	getPeopleFromRawProcedureArray,
} = require("./getPeopleFromRawProcedureArray");

const {
	getProceduresArrayFromRawProcedures,
} = require("./getProceduresArrayFromRawProcedures");

const getModelsFromRawProcedureArray = async function (rawProcedureArray) {
	const people = await getPeopleFromRawProcedureArray(rawProcedureArray);

	const procedures = await getProceduresArrayFromRawProcedures(
		rawProcedureArray
	);

	//TODO se a data for superior ao schedule, verificar o status atual do procedimento

	return {
		procedures,
		people,
	};
};

module.exports = {
	getModelsFromRawProcedureArray,
};
