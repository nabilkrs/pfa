const Patient = require("../models/patientModel");
const APIFeatures = require("./../utils/apiFeatures");
const AppError = require("./../utils/appError");
const bcrypt = require("bcryptjs");

/////When signing up , the patient gets his data based on the id in the token

exports.getPatientById = async (req, res, next) => {
  try {
    if (!req.params.PId) req.params.PId = req.patient._id;
    const patient = await Patient.findById(req.params.PId).populate({
      path: "docteur",
      select: "nom prenom mail telephone",
    });
    res.json({
      patient,
    });
  } catch (err) {
    console.log(err);
  }
};

/*************** filling scores************/

//// Jadas

exports.fillJADAS = async (req, res, next) => {
  if (req.params.PId != req.patient.id) {
    return next(
      new AppError(
        "You are not authorized to perform actions on other patients",
        401
      )
    );
  }
  const patient = await Patient.findById(req.params.PId);
  if (!patient.JADAS[0] || !patient.JADAS[0].state == 0) {
    return next(new AppError("pas de chaq à remplir", 401));
  }
  patient.JADAS[0].dateCalcul = new Date();
  patient.JADAS[0].state = 1;
  patient.JADAS[0].score = req.body.score;
  await patient.save();
  res.json({
    patient,
  });
};

//// Jspada

exports.fillJSPADA = async (req, res, next) => {
  if (req.params.PId != req.patient.id) {
    return next(
      new AppError(
        "You are not authorized to perform actions on other patients",
        401
      )
    );
  }
  const patient = await Patient.findById(req.params.PId);
  if (!patient.JSPADA[0] || !patient.JSPADA[0].state == 0) {
    return next(new AppError("pas de jspada à remplir", 401));
  }
  patient.JSPADA[0].dateCalcul = new Date();
  patient.JSPADA[0].state = 1;
  patient.JSPADA[0].score = req.body.score;
  await patient.save();
  res.json({
    patient,
  });
};

/// Chaq

exports.fillCHAQ = async (req, res, next) => {
  if (req.params.PId != req.patient.id) {
    return next(
      new AppError(
        "You are not authorized to perform actions on other patients",
        401
      )
    );
  }
  const patient = await Patient.findById(req.params.PId);
  if (!patient.CHAQ[0] || !patient.CHAQ[0].state == 0) {
    return next(new AppError("pas de chaq à remplir", 401));
  }
  patient.CHAQ[0].dateCalcul = new Date();
  patient.CHAQ[0].state = 1;
  patient.CHAQ[0].score = req.body.score;
  patient.CHAQ[0].douleurs = req.body.douleurs;
  patient.CHAQ[0].evaluation = req.body.evaluation;
  await patient.save();
  res.json({
    patient,
  });
};

/// doctor gets all his patients

exports.getAllPatients = async (req, res, next) => {
  try {
    if (!req.body.docteur) req.body.docteur = req.doctor.id;
    if (req.params.docId != req.doctor.id) {
      return next(
        new AppError(
          "You are not authorized to get other doctors patients",
          401
        )
      );
    }
    const features = new APIFeatures(
      Patient.find().where("docteur").equals(req.body.docteur),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const patients = await features.query.populate({
      path: "docteur",
      select: "nom prenom mail telephone",
    });
    next();
    res.json({ patients: patients });
  } catch (err) {
    console.log(err);
  }
};

/// get waiting patients

exports.getWaitingPatients = async (req, res, next) => {
  try {
    if (!req.body.docteur) req.body.docteur = req.doctor.id;
    if (req.params.docId != req.doctor.id) {
      return next(
        new AppError(
          "You are not authorized to get other doctors patients",
          401
        )
      );
    }
    const features = new APIFeatures(
      Patient.find()
        .where("docteur")
        .equals(req.body.docteur)
        .or([
          { "JADAS.state": 1 },
          { "JSPADA.state": 1 },
          { "JAMAR.state": 1 },
          { "CHAQ.state": 1 },
        ]),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const patients = await features.query.populate({
      path: "docteur",
      select: "nom prenom mail telephone",
    });
    res.json({
      patients: patients,
    });
  } catch (err) {
    console.log(err);
  }
};

///// adding a patient (signing him up but with not token)

exports.addPatient = async (req, res, next) => {
  try {
    req.body.docteur = req.doctor.id;
    if (req.params.docId != req.body.docteur) {
      return next(
        new AppError(
          "You are not authorized to add other doctors patients",
          401
        )
      );
    }
    req.body.password = String(req.body.num_dossier);
    const newPatient = await Patient.create(req.body);
    res.json({
      patient: newPatient,
    });
  } catch (err) {
    console.log(err);
  }
};

/*******************evaluation-ordonnance**************/

exports.updateOrdonnance = async (req, res, next) => {
  try {
    if (req.params.docId != req.doctor.id) {
      return next(
        new AppError(
          "You are not authorized to update ordonnance for other doctors patients",
          401
        )
      );
    }
    const currentPatient = await Patient.findOne({
      _id: req.params.PId,
      docteur: req.params.docId,
    });
    currentPatient.ordonnance = req.body.ordonnance;
    await currentPatient.save();
    res.json(currentPatient);
  } catch (err) {
    console.log(err);
  }
};

exports.updateEvaluation = async (req, res, next) => {
  try {
    if (req.params.docId != req.doctor.id) {
      return next(
        new AppError(
          "You are not authorized to update evaluation for other doctors patients",
          401
        )
      );
    }
    const currentPatient = await Patient.findOne({
      _id: req.params.PId,
      docteur: req.params.docId,
    });
    currentPatient.evaluation = req.body.evaluation;
    await currentPatient.save();
    res.json(currentPatient);
  } catch (err) {
    console.log(err);
  }
};

////// asking for scores

//jadas

exports.askforJADAS = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to add ask other doctors patients for jadas",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  patient.JADAS.unshift({
    dateDemande: new Date(),
    state: 0,
  });
  if (patient.JADAS.length >= 6) patient.JADAS.pop();
  await patient.save();
  res.json({
    patient,
  });
};

//jspada

exports.askforJSPADA = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to ask other doctors patients for JSPADA",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  patient.JSPADA.unshift({
    dateDemande: new Date(),
    state: 0,
  });
  if (patient.JSPADA.length >= 6) patient.JSPADA.pop();
  await patient.save();
  res.json({
    patient,
  });
};

// chaq

exports.askforCHAQ = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to ask other doctors patients for CHAQ",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  patient.CHAQ.unshift({
    dateDemande: new Date(),
    state: 0,
  });
  if (patient.CHAQ.length >= 6) patient.CHAQ.pop();
  await patient.save();
  res.json({
    patient,
  });
};

// valdating scores

//jadas

exports.validateJADAS = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to validate jadas for other doctors patients",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  if (!patient.JADAS[0]) {
    return next(new AppError("pas de jadas à valider", 401));
  }
  patient.JADAS[0].dateValidation = new Date();
  patient.JADAS[0].state = 2;
  await patient.save();
  res.json({
    patient,
  });
};

//jspada

exports.validateJSPADA = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to validate jspada for other doctors patients",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  if (!patient.JSPADA[0]) {
    return next(new AppError("pas de jspada à valider", 401));
  }
  patient.JSPADA[0].dateValidation = new Date();
  patient.JSPADA[0].state = 2;
  await patient.save();
  res.json({
    patient,
  });
};

//chaq

exports.validateCHAQ = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to validate chaq for other doctors patients",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  if (!patient.CHAQ[0]) {
    return next(new AppError("pas de chaq à valider", 401));
  }
  patient.CHAQ[0].dateValidation = new Date();
  patient.CHAQ[0].state = 2;
  await patient.save();
  res.json({
    patient,
  });
};

/*************bilan**************/

exports.askforBILAN = async (req, res, next) => {
  try {
    if (req.params.docId != req.doctor.id) {
      return next(
        new AppError(
          "You are not authorized to ask other doctors patients for bilan",
          401
        )
      );
    }
    const patient = await Patient.findOne({
      _id: req.params.PId,
      docteur: req.params.docId,
    });
    patient.Bilan[0] = {
      type_bilan: req.body.type_bilan,
      dateDemande: new Date(),
      state: 0,
    };
    await patient.save();
    res.json({ patient });
  } catch (err) {
    console.log(err);
  }
};

exports.validateBILAN = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to validate bilan for other doctors patients",
        401
      )
    );
  }
  try {
    const patient = await Patient.findOne({
      _id: req.params.PId,
      docteur: req.params.docId,
    });
    patient.Bilan[0].state = 1;
    await patient.save();
    res.json({ patient });
  } catch (err) {
    console.log(err);
  }
};

//////Delete score

//jadas

exports.deleteJADAS = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to add ask other doctors patients for jadas",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  patient.JADAS.shift();
  await patient.save();
  res.json({
    data: null,
  });
};

//jspada

exports.deleteJSPADA = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to ask other doctors patients for JSPADA",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  patient.JSPADA.shift();
  await patient.save();
  res.json({
    data: null,
  });
};

// chaq

exports.deleteCHAQ = async (req, res, next) => {
  if (req.params.docId != req.doctor.id) {
    return next(
      new AppError(
        "You are not authorized to ask other doctors patients for CHAQ",
        401
      )
    );
  }
  const patient = await Patient.findOne({
    _id: req.params.PId,
    docteur: req.params.docId,
  });
  patient.CHAQ.shift();
  await patient.save();
  res.json({
    data: null,
  });
};
