const cron = require("node-cron");
const LBC = require("leboncoin-api");
const nodemailer = require("nodemailer");
const credentials = require("./credentials.json");
const fs = require("fs");

function writeToFIle(data) {
  const json = JSON.stringify(data, null, 2);
  fs.writeFile(`${__dirname}/data.json`, json, function(error) {
    if (error) {
      console.log(error);
    } else {
      console.log("success");
    }
  });
}

function sendEmail(data) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: credentials.EMAIL,
      pass: credentials.PASSWORD
    }
  });

  const mailOptions = {
    from: "myserver@gmail.com",
    to: credentials.EMAIL,
    subject: "Dernière annonce LBC",
    html:
      "<p>" +
      data.title +
      "</p><br/><p>" +
      data.date +
      "</p><br/><p>" +
      data.desc +
      '</p><br/><a href="' +
      data.link +
      '">' +
      data.link +
      "</a>"
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(res);
  });
}

function buildDataModel(data) {
  const annonces = {};
  data.map(el => {
    const date = `${el.date.getDate()}/${el.date.getMonth()}/${el.date.getFullYear()}`;
    annonces[el.id] = {
      id: el.id,
      title: el.title,
      link: el.link,
      desc: el.description,
      date: el.date
    };
  });
  return annonces;
}

function sendDataToUser(data) {
  const annonces = buildDataModel(data);
  const annoncesLbcIds = Object.keys(annonces);
  const fileData = JSON.parse(fs.readFileSync(`${__dirname}/data.json`));
  const dataFileIds = Object.keys(fileData);
  annoncesLbcIds.forEach(key => {
    const include = dataFileIds.includes(key);
    if (!include) {
      console.log("not included", [annonces[key]]);
      fileData[annonces[key].id] = annonces[key];
      setTimeout(() => sendEmail(annonces[key]), 1000);
    }
  });
  writeToFIle(fileData);
}

// cron.schedule("*/1 * * * *", () => {
  var search = new LBC.Search()
    .setPage(1)
    .setFilter(LBC.FILTERS.ALL)
    .setCategory("locations")
    .setRegion("gironde")
    .setLocation([{ zipcode: "33000" }, { zipcode: "33300" }])
    .addSearchExtra("price", { min: 800, max: 1000 })
    .setSort({ sort_by: "date", sort_order: "desc" });

  search.run().then(function(data) {
    data && sendDataToUser(data.results);
  }, function(error){
  	console.log(error)
  });

//   console.log("running a task every 10 minutes");
// });
