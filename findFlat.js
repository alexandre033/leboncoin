const LBC = require("leboncoin-api");
const fileData = require('./data.json')
const nodemailer = require("nodemailer");
const credentials = require('./credentials.json')
var fs = require('fs')
let home = process.env['HOME']
console.log(home)


function writeToFIle(data){
  const json = JSON.stringify(data, null, 2)
  fs.writeFile('data.json', json, function(error){
    if(error){
      console.log(error)
    } else {
      console.log('success')
    }
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
    html:   '<p>'+data.title+'</p><br/><p>'+data.date+'</p><br/><p>'+data.desc+'</p><br/><a href="'+data.link+'">'+data.link+'</a>'
  };
  
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else
      console.log(res)
  });
}

function buildDataModel(data){
  const annonces = {};
  (data || []).map(el => {
    const date = `${el.date.getDate()}/${el.date.getMonth()}/${el.date.getFullYear()}`
    annonces[el.id] = {
      id: el.id,
      title: el.title,    
      link: el.link,
      desc: el.description,
      date
    }
  });
      return annonces
  }

  let notIncluded = []
  var search = new LBC.Search()
  .setPage(1)
  .setFilter(LBC.FILTERS.ALL)
  .setCategory("locations")
  .setRegion("gironde")
  .setLocation([{"zipcode": "33000"},{"zipcode": "33300"}])
  .addSearchExtra("price", {min: 800, max: 1000}) 
  .setSort({sort_by:"date",sort_order:"desc"})
  
  search.run().then( function(data) {
    const annonces = data && buildDataModel(data.results);
    // writeToFIle(annonces)
    const dataFileIds = Object.keys(fileData)
    const annoncesIds = Object.keys(annonces)
    annoncesIds.forEach(key => {
      const include = dataFileIds.includes(key)
      if(!include) {
        console.log('not included', [annonces[key]])
        notIncluded.push({[annonces[key].id]: annonces[key]})
        sendEmail(annonces[key])
       }
     });

     if(notIncluded.length > 0) {
      fs.readFile(`${home}/Documents/LBC/data.json`, function(err, data){
        let obj = JSON.parse(data)
        notIncluded.forEach(el => {
          return obj = {...obj, ...el}
         })
         writeToFIle(obj)
      })
     }
    });
  



