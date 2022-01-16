const Patient = require("./../models/patientModel");
const util = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_PAT, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.loginPat = catchAsync(async (req, res, next) => {
  const telephone = req.body.telephone;
  const password = req.body.password;
  const num_dossier = Number(req.body.password);
  // 1) Check if telephone & password exists
  if (!telephone || !password) {
    return next(new AppError("Please provide telephone && password", 400));
  }
  // 2) Check if user exists && password is correct
  const patient = await Patient.findOne({
    telephone: telephone,
    num_dossier: num_dossier,
  }).select("+password");
  if (
    !patient ||
    !(await patient.correctPasswordPatient(password, patient.password))
  ) {
    return next(new AppError("incorrect phone or password", 401));
  }
  // 3) If everything ok, send token to client
  const token = signToken(patient._id);
  res.json({
    token: token,
  });
});

exports.protectPat = catchAsync(async (req, res, next) => {
  // 1) get the token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("No token sent , you are not logged in", 401));
  }

  // 2) Verification token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_PAT
  );

  // 3) Check if user still exixts
  const currentPatient = await Patient.findById(decoded.id);
  if (!currentPatient) {
    return next(
      new AppError(
        "the user belonging to this token does no longer exist.",
        401
      )
    );
  }

  /// Grant acess to protected route
  req.patient = currentPatient;
  next();
});
