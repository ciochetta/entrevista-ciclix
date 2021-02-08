const {
	getRawPeopleArrayFromProcedureArray,
} = require("../functions/utils/getRawPeopleArrayFromProcedureArray");

const testJson = [
	{
		id: "0001",
		patient: "Arnaldo César Coelho",
		patient_mac: "00:00:00:00:00:01",
		procedure: 1,
		protocol: 11100022233,
		staff: [
			{
				physician_name: "Patrick dos Santos",
				physician_mac: "11:00:00:00:00:01",
			},
			{
				physician_name: "Adelaide Santana",
				physician_mac: "11:00:00:00:00:02",
			},
		],
		schedule: "06:00:00",
		surgery_room: "Sala de Cirurgia 1",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 1",
		cleaning_staff_mac: "22:00:00:00:00:01",
	},
	{
		id: "0002",
		patient: "Débora Amorim",
		patient_mac: "00:00:00:00:00:02",
		procedure: 1,
		protocol: 11100022244,
		staff: [
			{
				physician_name: "Patrick dos Santos",
				physician_mac: "11:00:00:00:00:01",
			},
			{
				physician_name: "Adelaide Santana",
				physician_mac: "11:00:00:00:00:02",
			},
		],
		schedule: "08:30:00",
		surgery_room: "Sala de Cirurgia 1",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 1",
		cleaning_staff_mac: "22:00:00:00:00:01",
	},
	{
		id: "0003",
		patient: "Assumpção Carvalho",
		patient_mac: "00:00:00:00:00:03",
		procedure: 1,
		protocol: 11100022255,
		staff: [
			{
				physician_name: "Patrick dos Santos",
				physician_mac: "11:00:00:00:00:01",
			},
			{
				physician_name: "Adelaide Santana",
				physician_mac: "11:00:00:00:00:02",
			},
		],
		schedule: "11:00:00",
		surgery_room: "Sala de Cirurgia 1",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 2",
		cleaning_staff_mac: "22:00:00:00:00:01",
	},
	{
		id: "0004",
		patient: "José da Silva",
		patient_mac: "00:00:00:00:00:04",
		procedure: 2,
		protocol: 11100022256,
		staff: [
			{
				physician_name: "Manoel Santos",
				physician_mac: "11:00:00:00:00:03",
			},
			{
				physician_name: "Rafael Antônio",
				physician_mac: "11:00:00:00:00:04",
			},
		],
		schedule: "06:00:00",
		surgery_room: "Sala de Cirurgia 2",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 2",
		cleaning_staff_mac: "22:00:00:00:00:02",
	},
	{
		id: "0005",
		patient: "Ana Luísa",
		patient_mac: "00:00:00:00:00:05",
		procedure: 2,
		protocol: 11100022257,
		staff: [
			{
				physician_name: "Manoel Santos",
				physician_mac: "11:00:00:00:00:03",
			},
			{
				physician_name: "Rafael Antônio",
				physician_mac: "11:00:00:00:00:04",
			},
		],
		schedule: "08:30:00",
		surgery_room: "Sala de Cirurgia 2",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 2",
		cleaning_staff_mac: "22:00:00:00:00:02",
	},
	{
		id: "0006",
		patient: "Diogo Amante",
		patient_mac: "00:00:00:00:00:06",
		procedure: 2,
		protocol: 11100022258,
		staff: [
			{
				physician_name: "Manoel Santos",
				physician_mac: "11:00:00:00:00:03",
			},
			{
				physician_name: "Rafael Antônio",
				physician_mac: "11:00:00:00:00:04",
			},
		],
		schedule: "11:00:00",
		surgery_room: "Sala de Cirurgia 2",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 2",
		cleaning_staff_mac: "22:00:00:00:00:02",
	},
	{
		id: "0007",
		patient: "Manoela Prezado",
		patient_mac: "00:00:00:00:00:07",
		procedure: 3,
		protocol: 11100033311,
		staff: [
			{
				physician_name: "Arthur Silva",
				physician_mac: "11:00:00:00:00:05",
			},
			{
				physician_name: "Márcio Gomes",
				physician_mac: "11:00:00:00:00:06",
			},
		],
		schedule: "06:00:00",
		surgery_room: "Sala de Cirurgia 3",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 3",
		cleaning_staff_mac: "22:00:00:00:00:03",
	},
	{
		id: "0008",
		patient: "Bianca Prestes",
		patient_mac: "00:00:00:00:00:08",
		procedure: 3,
		protocol: 11100033322,
		staff: [
			{
				physician_name: "Arthur Silva",
				physician_mac: "11:00:00:00:00:05",
			},
			{
				physician_name: "Márcio Gomes",
				physician_mac: "11:00:00:00:00:06",
			},
		],
		schedule: "08:30:00",
		surgery_room: "Sala de Cirurgia 3",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 3",
		cleaning_staff_mac: "22:00:00:00:00:03",
	},
	{
		id: "0009",
		patient: "Yuri Zagonnel",
		patient_mac: "00:00:00:00:00:09",
		procedure: 3,
		protocol: 11100033322,
		staff: [
			{
				physician_name: "Arthur Silva",
				physician_mac: "11:00:00:00:00:05",
			},
			{
				physician_name: "Márcio Gomes",
				physician_mac: "11:00:00:00:00:06",
			},
		],
		schedule: "11:00:00",
		surgery_room: "Sala de Cirurgia 3",
		estimated_surgery_time: "02:30:00",
		cleaning_staff: "Equipe 3",
		cleaning_staff_mac: "22:00:00:00:00:03",
	},
];

test("Parse people", () => {
	const result = getRawPeopleArrayFromProcedureArray(testJson);

	console.log(result);

	expect(1 === 1).toBe(true);
});
