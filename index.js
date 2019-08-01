const express = require("express");
const admin = require("firebase-admin");
const App = express();
const LBC = require("leboncoin-api");
const data = require("./data.json");
var credentials = require("./credentials.json");
var collection = "annonces";
// const initLat = { start: 44.837491, end: 44.856632 };
// const initLng = { start: -0.590386, end: -0.567292 };

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  databaseURL: "https://leboncoin-d7b55.firebaseio.com"
});
var firestore = admin.firestore();
if (data && typeof data === "object") {
  Object.keys(data).forEach(docKey => {
    firestore
      .collection(collection)
      .doc(docKey)
      .set(data[docKey])
      .then(res => {
        console.log("Document " + docKey + " successfully written!");
      })
      .catch(error => {
        console.error("Error writing document: ", error);
      });
  });
}
// console.log(db.collection("annonces"));
// function getData() {
//   var search = new LBC.Search()
//     .setPage(1)
//     .setFilter(LBC.FILTERS.PARTICULIER)
//     .setCategory("locations")
//     .setRegion("gironde")
//     .setLocation([{ zipcode: "33000" }, { zipcode: "33300" }]);

//   search.run().then(function(data) {
//     console.log("data", data);
//     return data;
//   });
// }
// console.log(getData());
// App.get('/', async function(req, res){
//     console.log(await getData())
// })

// App.listen(4000)
