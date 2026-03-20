const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t257hoy.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("hello world");
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("rentalCar");
    const carsCollection = db.collection("Cars");

    app.post("/cars", async (req, res) => {
      const newCar = req.body;
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });

    app.get("/cars", async (req, res) => {
      const result = await carsCollection.find().toArray();
      res.send(result);
    });

    app.get("/featuredCars", async (req, res) => {
      const result = await carsCollection.find().limit(6).toArray();
      res.send(result);
    });

    app.get("/carDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    app.get("/myBookings", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.BookingEmail = email;
      }
      query.status = "Booked";
      
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/carDetails/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;

      const query = { _id: new ObjectId(id) };

      const existingCar = await carsCollection.findOne(query)
      if(!existingCar){
        return res.status(404).send({message: "Car not found"})
      }
      
      if(existingCar.status === "Booked"){
        return res.status(400).send({message: "car already booked"})
        
      }
      
      const updateDoc = {
        $set: updateData,
      };

      console.log("updated data ", updateDoc);
      const result = await carsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.get("/myListings", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.UserEmail = email;
      }
      console.log(query);
      const cursor = carsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/myListings/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
