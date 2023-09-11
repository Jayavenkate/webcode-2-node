import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import usersRouter from "./router/users.router.js";

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}
const app = express();
//http://localhost:8000
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;

export const client = new MongoClient(MONGO_URL);
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.use(cors(corsOptions));
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

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
