const {
	getModelsFromRawProcedureArray,
} = require("../utils/getModelsFromRawProcedureArray");

const sendProceduresController = async function (request, response) {
	const rawProcedureArray = request.body;

	try {
		await getModelsFromRawProcedureArray(rawProcedureArray);

		return response
			.status(200)
			.json({ Message: "Procedures sucessfully inserted" });
	} catch (error) {
		return response.status(500).json({
			Message: "Internal server error",
			Error: error,
		});
	}
};

module.exports = {
	sendProceduresController,
};
