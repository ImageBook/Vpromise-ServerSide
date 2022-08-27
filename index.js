const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7tllsfd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// console.log('uri', uri);
// console.log('client', client);

async function run() {
    try {
        await client.connect();
        const userCollection = client.db('vpromise-database').collection('users');
        const sentPromiseCollection = client.db('vpromise-database').collection('sent-promise');

        // store users
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // get user by email
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        })

        // post sent promises
        app.post('/sent-promises', async (req, res) => {
            const promise = req.body;
            const result = await sentPromiseCollection.insertOne(promise);
            res.send(result);
        })

        // get promise by email
        app.get('/sent-promises/:email', async (req, res) => {
            const email = req.params.email;
            const query = { senderEmail: email };
            const result = await sentPromiseCollection.find(query).toArray();
            res.send(result);
        })

        // get promise by phone number
        app.get('/received-promises/:phone', async (req, res) => {
            const number = req.params.phone;
            const query = { receiverContact: number };
            const result = await sentPromiseCollection.find(query).toArray();
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Vpromise server side!');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})