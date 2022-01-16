const express = require("express");
const app = express();
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
dotenv.config({ path: "./config.env" });

app.use(helmet());

const PORT = 4000;
app.use(cors());
app.use(express.json());

// contre Nosql injection
app.use(mongoSanitize());

// contre cross-site-scripting
app.use(xss());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});

const uri =
  "mongodb+srv://express:bookrecsys123@cluster0.9xnsy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose
  .connect(
    "mongodb+srv://nabeel:nabeel@hanen.z9zbk.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(
    () => {
      console.log("Database sucessfully connected");
    },
    (error) => {
      console.log("Database could not be connected: " + error);
    }
  );
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
