const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT
const uri = process.env.MONGODB_URI

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

    const db = client.db('DriveFleet')
    const carsCollection = db.collection('cars')

    app.post('/cars', async(req, res)=> {
        const car = req.body
        console.log(car)
        
        const result = await carsCollection.insertOne(car)
        res.json(result)


    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);










app.get('/', (req, res) =>{
    res.send('Server is running')
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

