const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const doctorSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  cin: {
    type: String,
    required: true,
    unique: true,
    maxlength: 8,
    minlength: 8,
  },
  mail: {
    type: String,
    validate: validator.isEmail,
    unique: true,
    lowercase: true,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  hopital: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: [true, "please enter a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "please confirm a password"],
    validate: {
      //works only on save
      validator: function (el) {
        return el === this.password;
      },
    },
    message: "Passwords are not the same",
  },
  //for future use
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

doctorSchema.pre("save", async function (next) {
  //only run the function if pw is modified
  if (!this.isModified("password")) return next();
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

/* this is an instance method : an instance method in a 
method which is available for each document in a certain collection */
doctorSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

doctorSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
