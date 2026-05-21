const dns = require('node:dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs')
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

const JWKS = createRemoteJWKSet(
  new URL('http://localhost:3000/api/auth/jwks')
)

const verifyToken = async(req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: 'Unauthorized Access'
    });
  }
  // console.log(authHeader)

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Invalid Token'
    })
  }
  // console.log(token)
  try {
    const { payload } = await jwtVerify(token, JWKS)
    console.log(payload)
    
  } catch (error) {
    console.error('Token validation failed:', error)
    return res.status(403).json({
   message: 'Forbidden Access'
})
  }


  next()
};

async function run() {
  try {
    await client.connect()

    const db = client.db('DriveFleet')
    const carsCollection = db.collection('cars')
    const bookingCollection = db.collection('bookings')
    const myAddedCarsCollection = db.collection('my-added-cars')

    // app.post('/cars', async (req, res) => {
    //   const car = req.body
    //   console.log(car)

    //   const result = await carsCollection.insertOne(car)
    //   res.json(result)
    // })

    app.post('/bookings',verifyToken, async (req, res) => {
      const booking = req.body
      console.log(booking)

      const result = await bookingCollection.insertOne(booking)
      if (booking.carId) {
        const count = await carsCollection.updateOne({ _id: new ObjectId(booking.carId) }, { $inc: { bookingCount: 1 } })
        console.log(count)

      }
      res.json(result)
    })

    app.post('/my-added-cars',verifyToken, async (req, res) => {
      const booking = req.body
      console.log(booking)
      const result = await myAddedCarsCollection.insertOne(booking)
      res.json(result)
    })



    app.get('/cars', async (req, res) => {
      // const header = req.headers.authorization
      // console.log(header)

      const result = await carsCollection.find().toArray()
      res.json(result)
    })

    app.get('/cars/:id',verifyToken, async (req, res) => {
      const {id} = await req.params
      console.log(id)
      
      const result = await carsCollection.findOne({_id: new ObjectId(id)})
      console.log(result)
      
      res.json(result)

    })

    app.get('/car', async (req, res) => {

      const { search, type } = req.query;

      let query = {};

      // search by car name
      if (search) {
        query.carName = {
          $regex: search,
          $options: 'i'
        };
      }

      // search by car type
      if (type) {
        query.carType = {
          $regex: type,
          $options: 'i'
        };
      }

      const result = await carsCollection.find(query).toArray();
      res.status(200).json(result);
    });

    app.get(`/my-added-cars/:userId`,verifyToken, async (req, res) => {
      const { userId } = req.params

      const result = await myAddedCarsCollection.find({ userId }).toArray()
      res.json(result)
    })

    app.get('/bookings',verifyToken, async (req, res) => {
      const result = await bookingCollection.find().toArray()
      res.json(result)
    })

    app.get('/bookings/:userId',verifyToken, async (req, res) => {
      const { userId } = req.params
      const result = await bookingCollection.find({ userId }).toArray()
      res.json(result)
    })



    app.patch(`/my-added-cars/:id`,verifyToken, async (req, res) => {
      const { id } = req.params
      const updateData = req.body
      const result = myAddedCarsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateData
        }
      )
      // console.log(result)
      res.json(result)
    })


    // app.patch(`/cars/:id`, async (req, res) => {
    //   const { id } = req.params
    //   // const updateData = req.body
    //   const result = myAddedCarsCollection.updateOne(
    //     { _id: new ObjectId(id) },
    //     {
    //       $inc: {
    //         bookingCount: +1
    //       }
    //     }
    //   )
    //   console.log(result)
    //   res.json(result)
    // })



    app.delete(`/my-added-cars/:id`,verifyToken, async (req, res) => {
      const { id } = req.params
      const result = myAddedCarsCollection.deleteOne({ _id: new ObjectId(id) })

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





app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

