import express from "express";
import {
  createUsers,
  getUserByName,
  updateOtp,
  getOtp,
  deleteOtp,
  updatePassword,
} from "../service/users.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();

async function generateHashedPassword(password) {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log(salt);
  console.log(hashedPassword);
  return hashedPassword;
}
router.post("/signup", express.json(), async function (request, response) {
  const { username, email, password } = request.body;
  const userFromDB = await getUserByName(email);
  console.log(userFromDB);
  if (userFromDB) {
    response.status(400).send({ message: "Email already exists" });
  } else if (password.length < 6) {
    response
      .status(400)
      .send({ message: "password must be at least 6 characters" });
  } else {
    const hashedPassword = await generateHashedPassword(password);
    const result = await createUsers({
      username: username,
      email: email,
      password: hashedPassword,
    });
    response.send(result);
  }
});
router.post("/login", async function (request, response) {
  try {
    const { email, password } = request.body;
    const userFromDB = await getUserByName(email);
    console.log(userFromDB);
    if (!userFromDB) {
      response.status(401).send({ message: "invalid credentials" });
    } else {
      const storedDBPassword = userFromDB.password;
      const isPasswordCheck = await bcrypt.compare(password, storedDBPassword);
      console.log(isPasswordCheck);
      if (isPasswordCheck) {
        const token = jwt.sign({ id: userFromDB._id }, process.env.SECRET_KEY);
        response.send({ message: "Login successfully", token: token });
      } else {
        response.status(400).send({ message: "invalid credentials" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/login/forgetpassword", async function (request, response) {
  const { email } = request.body;
  console.log(email);
  const userFromDb = await getUserByName(email);
  if (!userFromDb) {
    response.status(401).send({ message: "Invalid credentials" });
  } else {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const setOtp = updateOtp(email, randomNumber);
    const mail = sendMail(email, randomNumber);
    console.log(mail);
  }
  response.status(200).send({ message: "OTP sent successfully" });
});
function sendMail(email, randomNumber) {
  const sender = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Email,
      pass: process.env.Password,
    },
  });
  const composeMail = {
    from: process.env.Email,
    to: email,
    subject: "OTP for Reset Password",
    text: `OTP Number : ${randomNumber}`,
  };
  sender.sendMail(composeMail, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email ${info.response}`);
    }
  });
}

router.post("/verifyotp", async function (request, response) {
  const { OTP } = request.body;
  const otp = parseInt(OTP);
  const otpFromDB = await getOtp(otp);
  if (otpFromDB === null) {
    response.status(401).send({ message: "Invalid OTP" });
  } else if (otpFromDB.OTP === otp) {
    const deleteOtpDB = await deleteOtp(otp);
    response.status(200).send({ message: "OTP verified successfully" });
  }
});
router.post("/setpassword", express.json(), async function (request, response) {
  try {
    const { email, password } = request.body;
    const userFromDb = await getUserByName(email);

    if (!userFromDb) {
      response.status(401).send({ message: "Invalid Credentials" });
    } else if (password.length < 6) {
      response
        .status(400)
        .send({ message: "Password must be at least 6 characters" });
    } else {
      const hashedPassword = await generateHashedPassword(password);
      const result = await updatePassword(email, hashedPassword);

      response.send({ message: "password changed successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});
export default router;
