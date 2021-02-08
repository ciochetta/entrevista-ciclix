const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

const { sendProceduresController } = require("./controllers/sendProcedures");

exports.sendProcedures = functions.https.onRequest(sendProceduresController);

const { receiveEventController } = require("./controllers/eventController");

exports.receiveEvent = functions.https.onRequest(receiveEventController);
