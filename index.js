import { MongoClient, ServerApiVersion } from 'mongodb';
import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//MONGO DB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwkoz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Connect to the "storeDB" database and access its "store" collection
    const storeCollection = client.db("storeDB").collection("store");
    const userCollection = client.db("storeDB").collection("users");

    // posting it to the server
    app.post("/store", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await storeCollection.insertOne(newProduct);
      res.send(result);
    });
    //getting data from the server
    app.get("/store", async (req, res) => {
      const cursor = storeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


        /////==============================================USER RELATED APIs=========================================================
    //create new user
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("creating new user: ", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });
    // getting users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //get a data in the server
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    //update a data in the server
      app.put("/user/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateUser = req.body;
        const user = {
          $set: {
            email: updateUser.email,
            password: updateUser.password,
          },
        };
        const result = await userCollection.updateOne(filter, user, options);
        res.send(result);
      });
    //delete a data from the server
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    //patch
    app.patch("/user", async (req, res) => {
      const email = req.body.email;
      const filter = {email};
      const updateDoc = {
        $set: {
          lastSignInTime: req?.body?.lastSignInTime
        }
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to StoreDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

//MONGO DB



app.get("/", (req, res) => {
    res.send("CRUD Store is running...");
  });
  
  app.listen(port, () => {
    console.log(`CRUD Store is running on port: ${port}`);
  });
  