const Doctor = require("./../models/doctorModel");

exports.getDoctorById = async (req, res) => {
  await Doctor.findById(req.doctor.id, function (err, doctor) {
    if (err) {
      console.log(err);
    } else {
      res.json(doctor);
    }
  });
};
