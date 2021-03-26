const express		= require('express')
const bodyParser	= require('body-parser')
const cors			= require('cors')
const app 			= express()
const MongoClient 	= require('mongodb').MongoClient;
const port 			= 5000
const admin 		= require('firebase-admin');
require('dotenv').config()

// midddleware 
app.use(bodyParser.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()) // for parsing application/json

app.use(cors())






// database config
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vewnd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var serviceAccount = require("./configs/burj-al-arab-mern-10d0f-firebase-adminsdk-wy7fh-fa8e6f4db8.json");

	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount)
	});


client.connect(err => {
  const bookingCollection = client.db("`${process.env.DB_NAME}`").collection("`${process.env.COLLECTIONS}`");
  // perform actions on the collection object
  // console.log('db connected successfully')
  // client.close();
  
  app.post('/addBooking', (req, res) => {
  	const newBooking = req.body;
  	console.log(newBooking)
  	bookingCollection.insertOne(newBooking)
  	.then(result => { 
  		// console.log(result)
  		if (result.insertedCount > 0) {
  			res.send(result.insertedCount +'Booked with ID '+ result.insertedId);
  		}
  	})
  })  

    // get data from api 

  app.get('/bookings', (req, res) => {
	// console.log(req.headers.authorization)
    const bearer = req.headers.authorization;

    if (bearer && bearer.startsWith('Bearer ') ) {
        const idToken = bearer.split(' ')[1];
        // console.log({idToken});

        admin
          .auth()
          .verifyIdToken(idToken)
          .then((decodedToken) => {
            // const uid = decodedToken.uid;
            const tokenEmail = decodedToken.email;
            const queryEmail = req.query.email;
            // console.log({uid})
            // verify email 
            if (tokenEmail == queryEmail) {
                bookingCollection.find({email: req.query.email})
                .toArray( (err, docuements) => {
                    res.send(docuements);
                })
            } 
          })
          .catch((error) => {
            res.status(401).send("Unauthorized Access !!! ");
          });
    } else {
        res.status(401).send("Unauthorized Access !!! ");
    }
  	
  })
});

// 
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, ()=> {
	console.log('server running')
})