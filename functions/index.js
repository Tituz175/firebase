const functions = require("firebase-functions");

const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const express = require("express");
const cors = require("cors");

// main app
const app = express();
app.use(cors({ origin: true }));

// main db reference
const db = admin.firestore();

// routes
app.get("/", (req, res) => {
    return res.status(200).send("Hello World");
})

// create -> post()
app.post("/api/create", (req, res) => {
    (async () => {
        try {
            await db.collection("usersDetails").doc(`/${Date.now()}/`).create({
                id: Date.now(),
                name: req.body.name,
                mobile: req.body.mobile,
                address: req.body.address
            })

            return res.status(200).send({ status: 'success', msg: "Data Saved" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status: 'failed', msg: error });
        }
    })();
});

// get -> get()
// fetch -> single data from firestore using specific id
app.get("/api/get/:id", (req, res) => {
    (async () => {
        try {

            const reqDoc = db.collection("usersDetails").doc(req.params.id);
            let userDetails = await reqDoc.get();
            let response = userDetails.data();

            return res.status(200).send({ status: 'success', data: response });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status: 'failed', msg: error });
        }
    })();
});

// fetch -> all data from firestore 
app.get("/api/getAll", (req, res) => {
    (async () => {
        try {
            const query = db.collection("usersDetails")
            let response = [];

            await query.get().then((data) => {
                let docs = data.docs;
                docs.map((doc) => {
                    const selectedItem = {
                        id: doc.data().id,
                        name: doc.data().name,
                        mobile: doc.data().mobile,
                        address: doc.data().address
                    };

                    response.push(selectedItem);
                })
                return response;
            });

            return res.status(200).send({ status: 'success', data: response });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status: 'failed', msg: error });
        }
    })();
});

// update -> put()
app.put("/api/update/:id", (req, res) => {
    (async () => {
        try {
            const reqDoc = db.collection("usersDetails").doc(req.params.id)
            await reqDoc.update({
                name: req.params.name,
                mobile: req.params.mobile,
                address: req.params.address
            });

            return res.status(200).send({ status: 'success', msg: "Data Updated" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status: 'failed', msg: error });
        }
    })();
});

// delete -> delete()
app.delete("/api/delete/:id", (req, res) => {
    (async () => {
        try {
            const reqDoc = db.collection("usersDetails").doc(req.params.id)
            await reqDoc.delete();

            return res.status(200).send({ status: 'success', msg: "Data Deleted" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ status: 'failed', msg: error });
        }
    })();
});



// exports the api to firebase cloud 
exports.app = functions.https.onRequest(app);
