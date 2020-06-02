var express = require('express');
var router = express.Router();
var request = require('sync-request');
const {quartiers} = require('../public/javascripts/quartiers')
const {testOpen} = require('../public/javascripts/testOpen')


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

  let radius = req.body.radius ? req.body.radius : 1500;
  let moment = req.body.moment ? new Date(req.body.moment) : new Date();


  if(req.body.type) {
    console.log('je passe dans la partie userType')
    type = req.body.type, req.body.type, req.body.type;
    // Places Request
    var rawResult = request('GET', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type}`);
    var resultat = JSON.parse(rawResult.body);

    console.log(resultat.results[0].opening_hours.open_now)
    resultat.results[0].opening_hours.open_now ? console.log('putain de true') : console.log('putain de false') 

    // liste des lieux de type userType à plus de 4 étoiles
    var listeUserType = [];
    resultat.results.map((r, i) => {
      if (r.rating > 4 ) {
        listeUserType.push(r)
      }
    });

    // Random Places x 3
    var randomUserType = []
    var a = randomShake(listeUserType);
    randomUserType.push(a);
    for (var i  = 0 ; randomUserType.length < 2; i++) {
      var b = randomShake(listeUserType);
      if (b.place_id !== a.place_id) {
        randomUserType.push(b);
      }
    };
    for (var i  = 0 ; randomUserType.length < 3; i++) {
      var c = randomShake(listeUserType);
      if (c.place_id !== a.place_id && c.place_id !== b.place_id) {
        randomUserType.push(c);
      }
    };

    var suggestions = []
    randomUserType.map((p) => {
      // Google Places Detail Request 1/3
      var rawResultDetail = request('GET', `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${p.place_id}&fields:review`);
      var resultatDetail = JSON.parse(rawResultDetail.body);

      // Google Places Photo Request 1/3
      var photoRef = p.photos[0].photo_reference;
      var rawPhotoResult = request('GET', `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRef}`);

      suggestions.push({
        place_id:p.place_id,
        nom:p.name,
        coords:p.geometry.location,
        adresse:p.vicinity,
        rating:p.rating,
        isOpen:resultatDetail.result.opening_hours.open_now,
        openingHours:resultatDetail.result.opening_hours.weekday_text,
        reviews:[{
          auteur:resultatDetail.result.reviews[0].author_name,
          avatar:resultatDetail.result.reviews[0].profile_photo_url,
          note:resultatDetail.result.reviews[0].rating,
          texte:resultatDetail.result.reviews[0].text,
        },{
          auteur:resultatDetail.result.reviews[1].author_name,
          avatar:resultatDetail.result.reviews[1].profile_photo_url,
          note:resultatDetail.result.reviews[1].rating,
          texte:resultatDetail.result.reviews[1].text,
        },{
          auteur:resultatDetail.result.reviews[2].author_name,
          avatar:resultatDetail.result.reviews[2].profile_photo_url,
          note:resultatDetail.result.reviews[2].rating,
          texte:resultatDetail.result.reviews[2].text,
        }],
        photo:rawPhotoResult.url
      })
    });
    console.log('les suggestions dans la partie userType : ', suggestions)

  } else {
    console.log('je passe dans la partie defaultType')

    type = ['bar', 'restaurant', 'supermarket']; // en prod remplacer supermarket par 'night_club'

    ///////////////////////////////////
    // RECHERCHE DE TYPE CATEGORIE 1 //
    ///////////////////////////////////

    // // Places Request
    var rawResult = request('GET', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[0]}`);
    var resultat = JSON.parse(rawResult.body);

    // liste des lieux de type A à plus de 4 étoiles
    var listeTypeA = [];
    resultat.results.map((r, i) => {
      if (r.rating > 4 ) {
        listeTypeA.push(r)
      }
    });

    // Random Place 1/3
    // var randomTypeA = require('../public/files/fakeDatas/bars.json');
    var randomTypeA = randomShake(listeTypeA);

    // Google Places Detail Request 1/3
    var rawResultDetailA = request('GET', `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomTypeA.place_id}&fields:review`);
    var resultatDetailA = JSON.parse(rawResultDetailA.body);

    // Google Places Photo Request 1/3
    var photoRefA = randomTypeA.photos[0].photo_reference;
    var rawPhotoResultA = request('GET', `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefA}`);

    ///////////////////////////////////
    // RECHERCHE DE TYPE CATEGORIE 2 //
    ///////////////////////////////////

    // // Places Request
    rawResult = request('GET', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[1]}`);
    resultat = JSON.parse(rawResult.body);

    // liste des lieux de type B à plus de 4 étoiles
    var listeTypeB = [];
    resultat.results.map((r, i) => {
      if (r.rating > 4 ) {
        listeTypeB.push(r)
      }
    });

    // Random Place 2/3
    // var randomTypeB = require('../public/files/fakeDatas/restaurants.json');
    var randomTypeB = randomShake(listeTypeB);

    // Google Places Detail Request 2/3
    var rawResultDetailB = request('GET', `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomTypeB.place_id}&fields:review`);
    var resultatDetailB = JSON.parse(rawResultDetailB.body);

    // Google Places Photo Request 2/3
    var photoRefB = randomTypeB.photos[0].photo_reference;
    var rawPhotoResultB = request('GET', `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefB}`);

    ///////////////////////////////////
    // RECHERCHE DE TYPE CATEGORIE 3 //
    ///////////////////////////////////

    // // Places Request
    rawResult = request('GET', `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[2]}`);
    resultat = JSON.parse(rawResult.body);

    // liste des lieux de type C à plus de 4 étoiles
    var listeTypeC = [];
    resultat.results.map((r, i) => {
      if (r.rating > 4 ) {
        listeTypeC.push(r)
      }
    });

    // Random Place 3/3
    // var randomTypeC = require('../public/files/fakeDatas/clubs.json');
    var randomTypeC = randomShake(listeTypeC);

    // Google Places Detail Request 3/3
    var rawResultDetailC = request('GET', `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomTypeC.place_id}&fields:review`);
    var resultatDetailC = JSON.parse(rawResultDetailC.body);

    // Google Places Photo Request 2/3
    var photoRefC = randomTypeC.photos[0].photo_reference;
    var rawPhotoResultC = request('GET', `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefC}`);

    //Objet résultat pour Front 1
    var suggestionA = {
      place_id:randomTypeA.place_id,
      nom:randomTypeA.name,
      coords:randomTypeA.geometry.location,
      adresse:randomTypeA.vicinity,
      rating:randomTypeA.rating,
      isOpen:resultatDetailA.result.opening_hours.open_now,
      openingHours:resultatDetailA.result.opening_hours.weekday_text,
      reviews:[{
        auteur:resultatDetailA.result.reviews[0].author_name,
        avatar:resultatDetailA.result.reviews[0].profile_photo_url,
        note:resultatDetailA.result.reviews[0].rating,
        texte:resultatDetailA.result.reviews[0].text,
      },{
        auteur:resultatDetailA.result.reviews[1].author_name,
        avatar:resultatDetailA.result.reviews[1].profile_photo_url,
        note:resultatDetailA.result.reviews[1].rating,
        texte:resultatDetailA.result.reviews[1].text,
      },{
        auteur:resultatDetailA.result.reviews[2].author_name,
        avatar:resultatDetailA.result.reviews[2].profile_photo_url,
        note:resultatDetailA.result.reviews[2].rating,
        texte:resultatDetailA.result.reviews[2].text,
      }],
    photo:rawPhotoResultA.url
    }

    //Objet résultat pour Front 2
    var suggestionB = {
      place_id:randomTypeB.place_id,
      nom:randomTypeB.name,
      coords:randomTypeB.geometry.location,
      adresse:randomTypeB.vicinity,
      rating:randomTypeB.rating,
      isOpen:resultatDetailB.result.opening_hours.open_now,
      openingHours:resultatDetailB.result.opening_hours.weekday_text,
      reviews:[{
        auteur:resultatDetailB.result.reviews[0].author_name,
        avatar:resultatDetailB.result.reviews[0].profile_photo_url,
        note:resultatDetailB.result.reviews[0].rating,
        texte:resultatDetailB.result.reviews[0].text,
      },{
        auteur:resultatDetailB.result.reviews[1].author_name,
        avatar:resultatDetailB.result.reviews[1].profile_photo_url,
        note:resultatDetailB.result.reviews[1].rating,
        texte:resultatDetailB.result.reviews[1].text,
      },{
        auteur:resultatDetailB.result.reviews[2].author_name,
        avatar:resultatDetailB.result.reviews[2].profile_photo_url,
        note:resultatDetailB.result.reviews[2].rating,
        texte:resultatDetailB.result.reviews[2].text,
      }],
    photo:rawPhotoResultB.url
    }

    //Objet résultat pour Front 3
    var suggestionC = {
      place_id:randomTypeC.place_id,
      nom:randomTypeC.name,
      coords:randomTypeC.geometry.location,
      adresse:randomTypeC.vicinity,
      rating:randomTypeC.rating,
      isOpen:resultatDetailC.result.opening_hours.open_now,
      openingHours:resultatDetailC.result.opening_hours.weekday_text,
      reviews:[{
        auteur:resultatDetailC.result.reviews[0].author_name,
        avatar:resultatDetailC.result.reviews[0].profile_photo_url,
        note:resultatDetailC.result.reviews[0].rating,
        texte:resultatDetailC.result.reviews[0].text,
      },{
        auteur:resultatDetailC.result.reviews[1].author_name,
        avatar:resultatDetailC.result.reviews[1].profile_photo_url,
        note:resultatDetailC.result.reviews[1].rating,
        texte:resultatDetailC.result.reviews[1].text,
      },{
        auteur:resultatDetailC.result.reviews[2].author_name,
        avatar:resultatDetailC.result.reviews[2].profile_photo_url,
        note:resultatDetailC.result.reviews[2].rating,
        texte:resultatDetailC.result.reviews[2].text,
      }],
    photo:rawPhotoResultC.url
    }
    
    // Tableau total des suggestions à renvoyer en Front 
    var suggestions = [suggestionA, suggestionB, suggestionC];
    
    console.log('les suggestions dans la partie defaultType : ', suggestions)
  };


  // JSON pour le front
  res.json({status:'ok', suggestions})
});


module.exports = router;

