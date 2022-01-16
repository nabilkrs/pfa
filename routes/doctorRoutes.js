const express = require("express");
const doctorQueries = require("./../queries/doctorQueries");
const authDoctorQueries = require("../queries/authDoctorQueries");
const patientRoutes = require("./patientRoutes");

const doctorRoutes = express.Router();

doctorRoutes.use("/:docId/patients", patientRoutes);

/// auth

doctorRoutes.post("/signup", authDoctorQueries.signupDoc);
doctorRoutes.post("/login", authDoctorQueries.loginDoc);

/// get the logged in doctor data
doctorRoutes.route("/me").get(authDoctorQueries.protectDoc, (req, res) => {
  doctorQueries.getDoctorById(req, res);
});

module.exports = doctorRoutes;
