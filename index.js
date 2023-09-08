import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import usersRouter from "./router/users.router.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const app = express();
//http://localhost:8000
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;

export const client = new MongoClient(MONGO_URL);
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.use(cors());
app.use(express.json());
app.use("/", usersRouter);
app.get("/", function (request, response) {
  response.send("🙋‍♂️, 🌏 🎊✨🤩 webcode 2");
});

app.get("/screens", async function (request, response) {
  try {
    const screens = await client
      .db("b42wd2")
      .collection("screen")
      .find({})
      .toArray();
    response.status(200).send(screens);
  } catch (err) {
    response.status(401).send({ message: err });
  }
});

app.get("/showmovies", async function (request, response) {
  try {
    const showmovies = await client
      .db("b42wd2")
      .collection("shows")
      .find({})
      .toArray();
    response.status(200).send(showmovies);
  } catch (err) {
    response.status(401).send({ message: err });
  }
});
app.post("/createshow", async function (request, response) {
  const data = request.body;
  console.log(data);
  const result = await client.db("b42wd2").collection("shows").insertMany(data);

  response.send(result);
});
app.post("/createscreen", async function (request, response) {
  const data = request.body;
  console.log(data);
  const result = await client
    .db("b42wd2")
    .collection("screen")
    .insertMany(data);

  response.send(result);
});
// async function generateHashedPassword(password) {
//   const NO_OF_ROUNDS = 10;
//   const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
//   const hashedPassword = await bcrypt.hash(password, salt);
//   console.log(salt);
//   console.log(hashedPassword);
//   return hashedPassword;
// }
// app.post("/signup", async function (request, response) {
//   try {
//     const { name, email, password } = request.body;
//     const userFromDb = await client
//       .db("b42wd2")
//       .collection("users")
//       .findOne({ email: email });
//     console.log(userFromDb);
//     if (userFromDb) {
//       response.status(401).send({ message: "email already exists" });
//     } else if (password.length < 8) {
//       response
//         .status(400)
//         .send({ message: "Password must be at least 8 characters" });
//     } else {
//       const hashedPassword = await generateHashedPassword(password);
//       const result = await client.db("b42wd2").collection("users").insertOne({
//         name: name,
//         email: email,
//         password: hashedPassword,
//       });
//       response.send(result);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });

// app.post("/login", async function (request, response) {
//   try {
//     const { email, password } = request.body;
//     const userFromDb = await client
//       .db("b42wd2")
//       .collection("users")
//       .findOne({ email: email });
//     console.log(userFromDb);
//     if (!userFromDb) {
//       response.status(401).send({ message: "Invalid credentials" });
//     } else {
//       const storedDBPassword = userFromDb.password;
//       const isPasswordCheck = await bcrypt.compare(password, storedDBPassword);
//       console.log(isPasswordCheck);
//       if (isPasswordCheck) {
//         const token = jwt.sign({ id: userFromDb._id }, process.env.SECRET_KEY);
//         response
//           .status(200)
//           .send({ message: "successful login", token: token });
//       } else {
//         response.status(401).send({ message: "Invalid credentials" });
//       }
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });


app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
