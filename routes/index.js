var express = require('express');
var router = express.Router();
var request = require('sync-request');

// Google Places API key
var gPAPIkey = 'AIzaSyByBUDqPZi14gp-f3fhYOaolaBJNjj5q7E';

// Shake donne un Nombre au hasard 
function randomShake(liste) {
  var x = liste.length - 1;
  var random = Math.round(Math.random(Math.floor())*x);
  console.log('random : ', random, 'sur ', x)
  return liste[random];
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* POST resultats de Google Places SERIE A */
/* pas de catégorie, default ou custom position, default ou custom moment */
router.post('/shake', function(req, res, next) {

  // Valeurs de recherche par défaut
  let position;
  let type;

  if(!req.body.position) {
    res.json({status:'echec', message:'Vous devez choisir un lieu pour sortir'})
  } else {
    position = req.body.position;
  };

  if(!req.body.type) {
    type = ['bar', 'restaurant', 'supermarket']; // en prod remplacer supermarket par 'night_club'
  } else {
    type = [req.body.type, req.body.type, req.body.type]
  };
  
  let radius = req.body.radius ? req.body.radius : 500;

  console.log('actual radius : ', radius)
  // var moment = new Date();

  // RECHERCHE DE BARS

  // // Places Request
  var rawResult = request('GET', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[0]}`);
  var resultat = JSON.parse(rawResult.body);

  // liste des bars à plus de 4 étoiles
  var listeBars = [];
  resultat.results.map((r, i) => {
    if (r.rating > 4) {
      listeBars.push(r)
    }
  });

  // Random Place 1/3
  // var listeBars = require('./fakeDatas/bars.json');
  var randomBar = randomShake(listeBars);

  // Google Places Detail Request 1/3
  var rawResultDetailA = request('GET', `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomBar.place_id}&fields:review`);
  var resultatDetailA = JSON.parse(rawResultDetailA.body);

  // Google Places Photo Request 1/3
  var photoRefA = randomBar.photos[0].photo_reference;
  var rawPhotoResultA = request('GET', `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefA}`);

  //Objet résultat pour Front 1
  var suggestionA = {
    place_id:randomBar.place_id,
    nom:randomBar.name,
    coords:randomBar.geometry.location,
    adresse:randomBar.vicinity,
    rating:randomBar.rating,
    reviews:[resultatDetailA.result.reviews[0].text, resultatDetailA.result.reviews[1].text, resultatDetailA.result.reviews[2].text],
    photo:rawPhotoResultA.url
  }

  // RECHERCHE DE RESTAURANTS

  // // Places Request
  rawResult = request('GET', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[1]}`);
  resultat = JSON.parse(rawResult.body);

  // liste des restaurants à plus de 4 étoiles
  var listeRestaurants = [];
  resultat.results.map((r, i) => {
    if (r.rating > 4) {
      listeRestaurants.push(r)
    }
  });

  // Random Place 2/3
  // var listeRestaurants = require('./fakeDatas/restaurants.json');
  var randomRestaurant = randomShake(listeRestaurants);

  // Google Places Detail Request 2/3
  var rawResultDetailB = request('GET', `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomRestaurant.place_id}&fields:review`);
  var resultatDetailB = JSON.parse(rawResultDetailB.body);

  // Google Places Photo Request 2/3
  var photoRefB = randomRestaurant.photos[0].photo_reference;
  var rawPhotoResultB = request('GET', `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefB}`);

  //Objet résultat pour Front 2
  var suggestionB = {
    place_id:randomRestaurant.place_id,
    nom:randomRestaurant.name,
    coords:randomRestaurant.geometry.location,
    adresse:randomRestaurant.vicinity,
    rating:randomRestaurant.rating,
    reviews:[resultatDetailB.result.reviews[0].text, resultatDetailB.result.reviews[1].text, resultatDetailB.result.reviews[2].text],
    photo:rawPhotoResultB.url
  }

  // RECHERCHE DE CLUB

  // // Places Request
  rawResult = request('GET', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[2]}`);
  resultat = JSON.parse(rawResult.body);

  // liste des clubs à plus de 4 étoiles
  var listeClubs = [];
  resultat.results.map((r, i) => {
    if (r.rating > 0) {
      listeClubs.push(r)
    }
  });

  // Random Place 3/3
  // var listeClubs = require('./fakeDatas/clubs.json');
  var randomClub = randomShake(listeClubs);

  // Google Places Detail Request 3/3
  var rawResultDetailC = request('GET', `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomClub.place_id}&fields:review`);
  var resultatDetailC = JSON.parse(rawResultDetailC.body);

  // Google Places Photo Request 2/3
  var photoRefC = randomRestaurant.photos[0].photo_reference;
  var rawPhotoResultC = request('GET', `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefC}`);

  //Objet résultat pour Front 3
  var suggestionC = {
    place_id:randomClub.place_id,
    nom:randomClub.name,
    coords:randomClub.geometry.location,
    adresse:randomClub.vicinity,
    rating:randomClub.rating,
    reviews:[resultatDetailC.result.reviews[0].text, resultatDetailC.result.reviews[1].text, resultatDetailC.result.reviews[2].text],
    photo:rawPhotoResultC.url
  }

  // JSON pour le front
  res.json({status:'ok', resultBar: suggestionA, resultRestaurant:suggestionB, resultClub:suggestionC})
});


module.exports = router;

