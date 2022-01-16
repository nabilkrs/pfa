const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
let Patient = new Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    prenom: {
      type: String,
      required: true,
    },
    docteur: {
      type: mongoose.Schema.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date_naissance: {
      type: Date,
      required: true,
    },
    telephone: {
      type: Number,
      required: true,
    },
    num_dossier: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    diagnostic: {
      type: String,
      required: true,
    },
    ordonnance: [
      {
        type: [String],
        //required: true,
        minItems: 0,
        maxItems: 5,
      },
    ],
    evaluation: {
      type: Number,
    },
    JADAS: [
      {
        score: String,
        dateDemande: Date,
        dateCalcul: Date,
        dateValidation: Date,
        state: {
          type: Number,
          enum: [0, 1, 2],
        }, // 0: demandé, 1: rempli, 2: validé
      },
    ],
    JSPADA: [
      {
        score: String,
        dateDemande: Date,
        dateCalcul: Date,
        dateValidation: Date,
        state: {
          type: Number,
          enum: [0, 1, 2],
        }, // 0: demandé, 1: rempli, 2: validé
      },
    ],
    CHAQ: [
      {
        score: String,
        evaluation: String,
        douleurs: String,
        dateDemande: Date,
        dateCalcul: Date,
        dateValidation: Date,
        state: {
          type: Number,
          enum: [0, 1, 2],
        }, // 0: demandé, 1: rempli, 2: validé
      },
    ],
    JAMAR: [
      {
        score: String,
        dateDemande: Date,
        dateCalcul: Date,
        dateValidation: Date,
        state: {
          type: Number,
          enum: [0, 1, 2],
        }, // 0: demandé, 1: rempli, 2: validé
      },
    ],
    Bilan: [
      {
        type_bilan: [String],
        dateDemande: {
          type: Date,
          default: Date.now(),
        },
        state: {
          type: Number,
          enum: [0, 1],
        }, // 0: demandé, 1: done
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

Patient.virtual("age").get(function () {
  y = new Date();
  return Math.trunc((y - this.date_naissance) / (1000 * 60 * 60 * 24 * 365));
});

Patient.pre("save", async function (next) {
  //only run the function if pw is modified
  if (!this.isModified("password")) return next();
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

Patient.pre(/^find/, function (next) {
  if (!this.select("+password")) this.select("-password");
  next();
});

/* this is an instance method : an instance method in a 
method which is available for each document in a certain collection */
Patient.methods.correctPasswordPatient = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("Patient", Patient);
