const { saveEvent } = require("../utils/saveEvent");

const receiveEventController = async function (request, response) {
	const rawEvent = request.body;

	try {
		await saveEvent(rawEvent);

		return response.status(200).json({ Message: "Event sucessfully inserted" });
	} catch (error) {
		console.log(error);
		return response.status(500).json({
			Message: "Internal server error",
			Error: error,
		});
	}
};

module.exports = {
	receiveEventController,
};
