const express = require('express');
const App = express();
const LBC = require('leboncoin-api');
const initLat = {start: 44.837491, end: 44.856632}
const initLng = {start: -0.590386, end: -0.567292}

function getData(){
    var search = new LBC.Search()
    .setPage(1)
    .setFilter(LBC.FILTERS.PARTICULIER)
    .setCategory("locations")
    .setRegion("gironde")
    .setLocation([
                 {"zipcode": "33000"},
                 {"zipcode": "33300"},
                 ])
                 
    var results = search.run().then(function(data) {
        return data.results.filter(f => f.location.lat >= initLat.start && f.location.lat <= initLat.end && f.location.lng >= initLng.start && f.location.lng <= initLng.end);
    });
    return results
}

App.get('/', async function(req, res){
    console.log(await getData())
})

App.listen(3000)