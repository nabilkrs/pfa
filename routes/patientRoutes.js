const patientQueries = require("../queries/patientQueries");
const authDoctorQueries = require("../queries/authDoctorQueries");
const authPatientQueries = require("../queries/authPatientQueries");
const express = require("express");
const patientRoutes = express.Router({ mergeParams: true });

patientRoutes.post("/login", authPatientQueries.loginPat);

/// getting all patients

patientRoutes
  .route("/")
  .get(authDoctorQueries.protectDoc, patientQueries.getAllPatients);

/// getting waiting patients

patientRoutes
  .route("/waiting")
  .get(authDoctorQueries.protectDoc, patientQueries.getWaitingPatients);

patientRoutes
  .route("/me")
  .get(authPatientQueries.protectPat, patientQueries.getPatientById);

patientRoutes
  .route("/:PId")
  .get(authDoctorQueries.protectDoc, patientQueries.getPatientById);

patientRoutes
  .route("/:PId/fillJADAS")
  .post(authPatientQueries.protectPat, patientQueries.fillJADAS);

patientRoutes
  .route("/:PId/fillJSPADA")
  .post(authPatientQueries.protectPat, patientQueries.fillJSPADA);

patientRoutes
  .route("/:PId/fillCHAQ")
  .post(authPatientQueries.protectPat, patientQueries.fillCHAQ);

////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// register a new patient

patientRoutes
  .route("/add")
  .post(authDoctorQueries.protectDoc, patientQueries.addPatient);

/// update ordonnace

patientRoutes
  .route("/:PId/updateOrdonnance")
  .post(authDoctorQueries.protectDoc, patientQueries.updateOrdonnance);

/// update evaluation globale

patientRoutes
  .route("/:PId/updateEvaluation")
  .post(authDoctorQueries.protectDoc, patientQueries.updateEvaluation);

////////////////////////////////////////////////
/////////////////////SCORES/////////////////////
////////////////////////////////////////////////

/// ask for a jadas

patientRoutes
  .route("/:PId/newJADAS")
  .post(authDoctorQueries.protectDoc, patientQueries.askforJADAS);

/// validate a jadas

patientRoutes
  .route("/:PId/validJADAS")
  .post(authDoctorQueries.protectDoc, patientQueries.validateJADAS);

/// delete a jadas
patientRoutes
  .route("/:PId/deleteJADAS")
  .delete(authDoctorQueries.protectDoc, patientQueries.deleteJADAS);

/// ask for a jspada

patientRoutes
  .route("/:PId/newJSPADA")
  .post(authDoctorQueries.protectDoc, patientQueries.askforJSPADA);

/// validate a jspada

patientRoutes
  .route("/:PId/validJSPADA")
  .post(authDoctorQueries.protectDoc, patientQueries.validateJSPADA);

/// delete a jspada
patientRoutes
  .route("/:PId/deleteJSPADA")
  .delete(authDoctorQueries.protectDoc, patientQueries.deleteJSPADA);

/// ask for a chaq

patientRoutes
  .route("/:PId/newCHAQ")
  .post(authDoctorQueries.protectDoc, patientQueries.askforCHAQ);

/// validate a chaq

patientRoutes
  .route("/:PId/validCHAQ")
  .post(authDoctorQueries.protectDoc, patientQueries.validateCHAQ);

/// delete a jspada
patientRoutes
  .route("/:PId/deleteCHAQ")
  .delete(authDoctorQueries.protectDoc, patientQueries.deleteCHAQ);

///// ask for bilan

patientRoutes
  .route("/:PId/newBilan")
  .post(authDoctorQueries.protectDoc, patientQueries.askforBILAN);

/// validate a bilan

patientRoutes
  .route("/:PId/validateBilan")
  .post(authDoctorQueries.protectDoc, patientQueries.validateBILAN);

module.exports = patientRoutes;
