const Doctor = require("./../models/doctorModel");
const util = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_DOC, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signupDoc = catchAsync(async (req, res, next) => {
  const newDoctor = await Doctor.create(req.body);
  res.json({
    doctor: newDoctor,
  });
});

exports.loginDoc = catchAsync(async (req, res, next) => {
  const mail = req.body.mail;
  const password = req.body.password;
  // 1) Check if mail & password exists
  if (!mail || !password) {
    return next(new AppError("Please provide email && password", 400));
  }
  // 2) Check if user exists && password is correct
  const doctor = await Doctor.findOne({ mail }).select("+password");
  if (!doctor || !(await doctor.correctPassword(password, doctor.password))) {
    return next(new AppError("incorrect email or password", 401));
  }
  // 3) If everything ok, send token to client
  const token = signToken(doctor._id);
  res.json({
    token,
  });
});

exports.protectDoc = catchAsync(async (req, res, next) => {
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
    process.env.JWT_SECRET_DOC
  );

  // 3) Check if user still exixts
  const currentDoctor = await Doctor.findById(decoded.id);
  if (!currentDoctor) {
    return next(
      new AppError(
        "the user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  //code in user model
  if (currentDoctor.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  /// Grant acess to protected route
  req.doctor = currentDoctor;
  next();
});
