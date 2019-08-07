const admin = require("firebase-admin");
const LBC = require("leboncoin-api");
const fileData = require('./data.json')
const nodemailer = require("nodemailer");
const credentials = require('./credentials.json')
var fs = require('fs')
// var collection = "annonces";
// admin.initializeApp({
//   credential: admin.credential.cert(credentials),
//   databaseURL: "https://leboncoin-d7b55.firebaseio.com"
// });
// var db = admin.firestore();
// const initLat = { start: 44.837491, end: 44.856632 };
// const initLng = { start: -0.590386, end: -0.567292 };

// "1539733600": {
//   "id": 1539733600,
//   "title": "T2 de 69 m2 Bordeaux centre 33000",
//   "link": "https://www.leboncoin.fr/locations/1539733600.htm",
//   "desc": "T2  PLEIN CENTRE RUE VILLENEUVE BX , l'appartement situé ds un  immeuble de 4 appts est au 2éme étage  .et se compose : d'une entrée distribuant : 1 séjour double en alcove ouverte ,sur rue avec 2 portes fenêtres petits balconnets ,1chambre sur rue avec 1 porte fenêtre petit balconnet ,1 cuisine meublée avec plaque vitro ,1 salle de bains , 1 WC , Chauffage par convecteurs EDF, Cumulus eau chaude, Doubles vitrages ,VMC, \nCharges forfaitaires mensuelles de 84€ comportant : la taxe des ordures, l'eau froide , l'entretien des parties communes (ménage et EDF)    LOYER BASE 911€ LIBRE DE SUITE"
// },



function writeToFIle(data){
  fs.writeFile('data.json', JSON.stringify(data, undefined, 2), function(error) {
    console.log(error)
   })
}

function sendEmail(data){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: credentials.EMAIL,
           pass: credentials.PASSWORD
       }
   });
  
   const mailOptions = {
    from: 'myserver@gmail.com', 
    to: credentials.EMAIL,
    subject: 'Dernière annonce LBC', 
    html:   '<p>'+data.title+'</p><br/><a href="'+data.link+'">'+data.link+'</a>'
  };
  
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      return true;
  });
}

function buildDataModel(data){
  const annonces = {};
  (data || []).map(el => {
    annonces[el.id] = {
      id: el.id,
      title: el.title,
      link: el.link,
      desc: el.description
    }
  });
      return annonces
  }


  var search = new LBC.Search()
    .setPage(1)
    .setFilter(LBC.FILTERS.PARTICULIER)
    .setCategory("locations")
    .setRegion("gironde")
    .setLocation([{ zipcode: "33000" }, { zipcode: "33300" }])
    .addSearchExtra("price", {min: 800, max: 1000}) 

  search.run().then(function(data) {
     const annonces = data && buildDataModel(data.results);
     // writeToFIle(annonces)
     const dataFilekeys = Object.keys(fileData)
     const annoncesKeys = Object.keys(annonces)
     annoncesKeys.map(key => {
       const include = dataFilekeys.includes(key)
       if(!include) {
         console.log(annonces[key])
        //  sendEmail(annonces[key])
        //  fs.readFile('data.json', function(err, data){
        //   const obj = JSON.parse(data)
        //   obj[annonces[key].id] = annonces[key]
        //   writeToFIle(obj)
        // })
       }
     })

    });

