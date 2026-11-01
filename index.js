import express from 'express'
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors'


const app = express();
const port = 8000

app.use(cors())
app.use(express.json())


const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studiospace")
const studioCollection = db.collection("studios")
const bookingCollection = db.collection("bookings")


app.post('/add-new-studio', async(req, res) => {
  const data = req.body
  const result = await studioCollection.insertOne(data)

    console.log(result)
  res.send(result)
})


app.get('/explore-studios', async (req, res) => {
  const result = await studioCollection.find().toArray()
  res.send(result)
})


app.get('/explore-studios/:id', async (req, res)=>{
  const {id} = req.params
  const result = await studioCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})



// app.get('/my-listings', async(req, res)=>{
//     console.log("My Listings API Called");
//   try{

//     const result = await studioCollection.find().toArray()
//     res.status(200).send(result);
//   }catch (error){
//     console.log(error)
//     res.status(500).send({message: "Inter"})
//   }
// })


app.get('/my-listings/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const result = await studioCollection
      .find({ email: email })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Failed to fetch studio listings',
    });
  }
});







app.get('/featured-studios', async (req, res) => {
  const result = await studioCollection.find().limit(6).toArray()
  res.send(result)
})


app.post('/studio/book', async (req, res) => {
  const data = req.body
  const result = await bookingCollection.insertOne(data)
  res.send(result)
})


app.get('/my-bookings/:email', async(req, res) => {
  const email = req.params.email
  const result = await bookingCollection.find({email:email}).toArray()
  res.send(result)
})




// http://localhost:8000/my-bookings/:email

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})