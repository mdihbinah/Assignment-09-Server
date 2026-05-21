const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT
const uri = process.env.MONGODB_URI



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
    const bookingCollection = db.collection('bookings')
    const myAddedCarsCollection = db.collection('my-added-cars')

    app.post('/cars', async(req, res)=> {
        const car = req.body
        console.log(car)
        
        const result = await carsCollection.insertOne(car)
        res.json(result)
    })

    app.post('/bookings', async(req, res)=> {
        const booking = req.body
        console.log(booking)
        
        const result = await bookingCollection.insertOne(booking)
        res.json(result)
    })

    app.post('/my-added-cars', async(req, res)=> {
        const booking = req.body
        console.log(booking)
        const result = await myAddedCarsCollection.insertOne(booking)
        res.json(result)
    })



    app.get('/cars', async(req, res) => {
        const result = await carsCollection.find().toArray()
        res.json(result)
    })
    app.get('/car', async(req, res) => {
      const search = req.query.search
      // console.log(search)
      
        const result = await carsCollection.find({
          carName: {
            $regex: search,
            $options: 'i'
          }
        }).toArray()
        res.json(result)
    })

    app.get(`/my-added-cars/:userId`, async(req, res) => {
        const {userId} = req.params
        
        const result = await myAddedCarsCollection.find({userId}).toArray()
        res.json(result)
    })

    app.get('/bookings', async(req, res) => {
        const result = await bookingCollection.find().toArray()
        res.json(result)
    })

    app.get('/bookings/:userId', async(req, res) => {
      const {userId} = req.params
        const result = await bookingCollection.find({userId}).toArray()
        res.json(result)
    })

    app.patch(`/my-added-cars/:id`, async(req, res) => {
      const {id} = req.params
      const updateData = req.body
      const result = myAddedCarsCollection.updateOne(
        {_id: new ObjectId(id)},
        {
          $set: updateData
        }
      )
      console.log(result)
      res.json(result)
    })

    app.delete(`/my-added-cars/:id`, async(req, res) => {
      const {id} = req.params
      const result = myAddedCarsCollection.deleteOne({_id: new ObjectId(id)})

      console.log(result)
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

