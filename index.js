const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()

const PORT = 5000

const uri = "mongodb://DriveFleet:xSEUWrknHDyeXtuP@ac-m8tcky0-shard-00-00.6mg4csa.mongodb.net:27017,ac-m8tcky0-shard-00-01.6mg4csa.mongodb.net:27017,ac-m8tcky0-shard-00-02.6mg4csa.mongodb.net:27017/?ssl=true&replicaSet=atlas-q0lh1o-shard-0&authSource=admin&appName=Cluster0";

// DriveFleet
// xSEUWrknHDyeXtuP

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect()

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    await client.close();
  }
}
run().catch(console.dir);










app.get('/', (req, res) =>{
    res.send('Server is running')
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

