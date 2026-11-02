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


app.get('/explore-studios/:id', 
//   (req, res, next) => {
//   const authHeader = req.headers.authorization
//   console.log(authHeader, 'not a data')

//   if(authHeader!=="user logged in"){
//     return res.status(401).send({msg: 'Unauthorization!'})
//   }

//   next()
// }, 
async (req, res)=>{
  

  const {id} = req.params;
  const result = await studioCollection.findOne({_id: new ObjectId(id)});
  res.send(result);
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
            .find({ ownerEmail: email })
            .toArray();

        console.log("Requested Email:", email);
        console.log("Matched Studios:", result.length);

        res.status(200).send(result);

    } catch (error) {
        console.error("My Listings Error:", error);

        res.status(500).send({
            message: "Failed to fetch studio listings"
        });
    }
});






// Get single studio for editing
app.get('/my-listings/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid studio ID"
            });
        }

        const result = await studioCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!result) {
            return res.status(404).send({
                message: "Studio not found"
            });
        }

        res.send(result);

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Failed to fetch studio"
        });
    }
});




app.patch('/my-listings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerEmail, ...updatedData } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                message: "Invalid studio ID"
            });
        }

        const result = await studioCollection.updateOne(
            {
                _id: new ObjectId(id),
                ownerEmail: ownerEmail
            },
            {
                $set: updatedData
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({
                message: "Studio not found"
            });
        }

        res.send({
            success: true,
            message: "Studio updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).send({
            message: "Failed to update studio"
        });
    }
});




app.delete('/my-listings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerEmail } = req.body;

        const result = await studioCollection.deleteOne({
            _id: new ObjectId(id),
            ownerEmail: ownerEmail
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                message: "Studio not found"
            });
        }

        res.send({
            success: true,
            message: "Studio deleted successfully"
        });
    } catch (error) {
        res.status(500).send({
            message: "Failed to delete studio"
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







app.post('/my-bookings', async (req, res) => {
  const data = req.body
  const result = await bookingCollection.insertOne(data)
  res.send(result)
})






app.delete('/my-bookings/:id/cancel', async (req, res) => {
    const { id } = req.params;

    const result = await bookingCollection.updateOne(
        {
            _id: new ObjectId(id),
            status: "Pending"
        },
        {
            $set: {
                status: "Cancelled"
            }
        }
    );

    if (result.modifiedCount === 0) {
        return res.status(400).send({
            message: "Booking cannot be cancelled"
        });
    }

    res.send({
        success: true,
        message: "Booking cancelled successfully"
    });
});





app.get('/my-bookings/:email', async(req, res) => {
  const {email} = req.params
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

export default app