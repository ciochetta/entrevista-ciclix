const getLocationObjectFromName = function (name) {
	const lowerCaseName = name.toLowerCase();

	if (lowerCaseName.includes("sala de cirurgia")) {
		return {
			name: name,
			type: "surgery_room",
		};
	}

	if (lowerCaseName.includes("corredor")) {
		return {
			name: name,
			type: "corridor",
		};
	}

	if (lowerCaseName.includes("quarto")) {
		return {
			name: name,
			type: "resting_room",
		};
	}

	if (lowerCaseName.includes("escritorio")) {
		return {
			name: name,
			type: "office",
		};
	}

	throw "unknown type";
};

module.exports = { getLocationObjectFromName };
