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
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        // get logged in user info by phone number
        app.get('/user/:phone', async (req, res) => {
            const phone = req.params.phone;
            const query = { phone: phone };
            const result = await userCollection.findOne(query);
            res.send(result);
        })

        // update user info
        app.patch('/user/:phone', async (req, res) => {
            const phone = req.params.phone;
            const query = { phone: phone };
            const updateInfo = req.body;
            const updateDoc = {
                $set: updateInfo
            };
            const result = await userCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        // post sent promises
        app.post('/sent-promises', async (req, res) => {
            const promise = req.body;
            const result = await sentPromiseCollection.insertOne(promise);
            res.send(result);
        })

        // get promise by phone
        app.get('/sent-promises/:phone', async (req, res) => {
            const phone = req.params.phone;
            const query = { senderContact: phone };
            const result = await sentPromiseCollection.find(query).toArray();
            res.send(result);
        })

        // get promise by phone
        app.get('/received-promise/:phone', async (req, res) => {
            const phone = req.params.phone;
            const query = { receiverContact: phone };
            const result = await sentPromiseCollection.find(query).toArray();
            res.send(result);
        })

        // get promise by phone number & pending status
        app.get('/received-promises/:phone', async (req, res) => {
            const number = req.params.phone;
            const query = { receiverContact: number, status: 'Pending' };
            const result = await sentPromiseCollection.find(query).toArray();
            res.send(result);
        })
        // get promise by phone number & accepted status
        app.get('/received-accepted-promises/:phone', async (req, res) => {
            const number = req.params.phone;
            const query = { receiverContact: number, status: 'Accepted' };
            const result = await sentPromiseCollection.find(query).toArray();
            res.send(result);
        })
        // get promise by phone number & rejected status
        app.get('/received-rejected-promises/:phone', async (req, res) => {
            const number = req.params.phone;
            const query = { receiverContact: number, status: 'Rejected' };
            const result = await sentPromiseCollection.find(query).toArray();
            res.send(result);
        })

        // update promise status - accepted/rejected
        app.patch('/sent-promises/:id', async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: updateInfo
            };
            const result = await sentPromiseCollection.updateOne(filter, updateDoc);
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