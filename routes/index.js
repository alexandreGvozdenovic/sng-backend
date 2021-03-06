var express = require("express");
var router = express.Router();
var request = require("sync-request");
var descriptionBuild = require("../public/javascripts/descriptionBuild");

// Google Places API key
var gPAPIkey = process.env.G_PLACES_API_KEY;

// Shake donne un Nombre au hasard
function randomShake(liste) {
  var x = liste.length - 1;
  var random = Math.round(Math.random(Math.floor()) * x);
  return liste[random];
}

// Mettre en capital les initiales des noms
const capitalize = (texte) => {
  texte = texte.toLocaleLowerCase();
  let mots = texte.split(" ");
  let capWords = [];
  mots.map((m) => {
    let capM = m[0].toLocaleUpperCase() + m.slice(1);
    capWords.push(capM);
  });
  let capTexte = capWords.join(" ");
  return capTexte;
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: `Shake'n'Go Backend & API` });
});

/* POST resultats de Google Places SERIE A */
/* pas de catégorie, default ou custom position, default ou custom moment */
router.post("/shake", function (req, res, next) {
  // Valeurs de recherche par défaut
  let position;
  let type;

  if (!req.body.position) {
    res.json({
      status: "echec",
      message: "Vous devez choisir un lieu pour sortir",
    });
  } else {
    position = req.body.position;
  }

  let radius = req.body.radius ? req.body.radius : 2000;
  let moment = req.body.moment ? new Date(req.body.moment) : new Date();

  if (req.body.type != "") {
    type = req.body.type;
    if (type === "club") {
      type = "night_club";
    }

    // Places Request
    var rawResult = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type}`
    );
    var resultat = JSON.parse(rawResult.body);

    // liste des lieux de type userType à plus de 4 étoiles
    var listeUserType = [];
    resultat.results.map((r, i) => {
      if (r.rating > 3.5) {
        listeUserType.push(r);
      }
    });

    // filtre pour éviter les hôtels
    // listeUserType = listeUserType.filter(p => p.types.includes('lodging') === false);

    // Random Places x 3
    var randomUserType = [];
    var a = randomShake(listeUserType);
    randomUserType.push(a);
    for (var i = 0; randomUserType.length < 2; i++) {
      var b = randomShake(listeUserType);
      if (b.place_id !== a.place_id) {
        randomUserType.push(b);
      }
    }
    for (var i = 0; randomUserType.length < 3; i++) {
      var c = randomShake(listeUserType);
      if (c.place_id !== a.place_id && c.place_id !== b.place_id) {
        randomUserType.push(c);
      }
    }

    var suggestions = [];
    randomUserType.map((p) => {
      // Google Places Detail Request pour chacune des 3 places
      var rawResultDetail = request(
        "GET",
        `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${p.place_id}&fields:review`
      );
      var resultatDetail = JSON.parse(rawResultDetail.body);

      // Google Places Photo Request pour chacune des 3 places
      var photoRef = p.photos[0].photo_reference;
      var rawPhotoResult = request(
        "GET",
        `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRef}`
      );

      suggestions.push({
        place_id: p.place_id,
        type: req.body.type,
        nom: capitalize(p.name),
        coords: p.geometry.location,
        adresse: p.vicinity,
        rating: p.rating,
        description: descriptionBuild(req.body.type, p.price_level, p.rating),
        isOpen: resultatDetail.result.opening_hours.open_now,
        openingHours: resultatDetail.result.opening_hours.weekday_text,
        reviews: [
          {
            auteur: capitalize(resultatDetail.result.reviews[0].author_name),
            avatar: resultatDetail.result.reviews[0].profile_photo_url,
            note: resultatDetail.result.reviews[0].rating,
            texte: resultatDetail.result.reviews[0].text,
          },
          {
            auteur: capitalize(resultatDetail.result.reviews[1].author_name),
            avatar: resultatDetail.result.reviews[1].profile_photo_url,
            note: resultatDetail.result.reviews[1].rating,
            texte: resultatDetail.result.reviews[1].text,
          },
          {
            auteur: capitalize(resultatDetail.result.reviews[2].author_name),
            avatar: resultatDetail.result.reviews[2].profile_photo_url,
            note: resultatDetail.result.reviews[2].rating,
            texte: resultatDetail.result.reviews[2].text,
          },
        ],
        photo: rawPhotoResult.url,
      });
    });
  } else {
    type = ["bar", "restaurant", "night_club"]; // en prod remplacer supermarket par 'night_club'

    ///////////////////////////////////
    // RECHERCHE DE TYPE CATEGORIE 1 //
    ///////////////////////////////////

    // // Places Request
    var rawResult = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[0]}`
    );
    var resultat = JSON.parse(rawResult.body);

    // liste des lieux de type A à plus de 4 étoiles
    var listeTypeA = [];
    resultat.results.map((r, i) => {
      if (r.rating > 3.5) {
        listeTypeA.push(r);
      }
    });
    // filtre pour éviter les hôtels
    // listeTypeA = listeTypeA.filter(p => p.types.includes('lodging') === false);

    // Random Place 1/3
    var randomTypeA = randomShake(listeTypeA);

    // Google Places Detail Request 1/3
    var rawResultDetailA = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomTypeA.place_id}&fields:review`
    );
    var resultatDetailA = JSON.parse(rawResultDetailA.body);

    // Google Places Photo Request 1/3
    var photoRefA = randomTypeA.photos[0].photo_reference;
    var rawPhotoResultA = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefA}`
    );

    ///////////////////////////////////
    // RECHERCHE DE TYPE CATEGORIE 2 //
    ///////////////////////////////////

    // // Places Request
    rawResult = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[1]}`
    );
    resultat = JSON.parse(rawResult.body);

    // liste des lieux de type B à plus de 4 étoiles
    var listeTypeB = [];
    resultat.results.map((r, i) => {
      if (r.rating > 3.5) {
        listeTypeB.push(r);
      }
    });

    // filtre pour éviter les hôtels
    // listeTypeB = listeTypeB.filter(p => p.types.includes('lodging') === false);

    // Random Place 2/3
    var randomTypeB = randomShake(listeTypeB);

    // Google Places Detail Request 2/3
    var rawResultDetailB = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomTypeB.place_id}&fields:review`
    );
    var resultatDetailB = JSON.parse(rawResultDetailB.body);

    // Google Places Photo Request 2/3
    var photoRefB = randomTypeB.photos[0].photo_reference;
    var rawPhotoResultB = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefB}`
    );

    ///////////////////////////////////
    // RECHERCHE DE TYPE CATEGORIE 3 //
    ///////////////////////////////////

    // // Places Request
    rawResult = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${gPAPIkey}&location=${position}&radius=${radius}&type=${type[2]}`
    );
    resultat = JSON.parse(rawResult.body);

    // liste des lieux de type C à plus de 4 étoiles
    var listeTypeC = [];
    resultat.results.map((r, i) => {
      if (r.rating > 3.5) {
        listeTypeC.push(r);
      }
    });

    // filtre pour éviter les hôtels
    // listeTypeC = listeTypeC.filter(p => p.types.includes('lodging') === false);

    // Random Place 3/3
    var randomTypeC = randomShake(listeTypeC);

    // Google Places Detail Request 3/3
    var rawResultDetailC = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/details/json?key=${gPAPIkey}&language=fr&place_id=${randomTypeC.place_id}&fields:review`
    );
    var resultatDetailC = JSON.parse(rawResultDetailC.body);

    // Google Places Photo Request 2/3
    var photoRefC = randomTypeC.photos[0].photo_reference;
    var rawPhotoResultC = request(
      "GET",
      `https://maps.googleapis.com/maps/api/place/photo?key=${gPAPIkey}&maxwidth=400&photo_reference=${photoRefC}`
    );

    function formatNames(name) {
      if (name === "night_club") {
        return (newName = "club");
      } else {
        return name;
      }
    }

    //Objet résultat pour Front 1
    var suggestionA = {
      place_id: randomTypeA.place_id,
      type: formatNames(type[0]),
      nom: capitalize(randomTypeA.name),
      coords: randomTypeA.geometry.location,
      adresse: randomTypeA.vicinity,
      rating: randomTypeA.rating,
      description: descriptionBuild(
        type[0],
        randomTypeA.price_level,
        randomTypeA.rating
      ),
      isOpen: resultatDetailA.result.opening_hours.open_now,
      openingHours: resultatDetailA.result.opening_hours.weekday_text,
      reviews: [
        {
          auteur: capitalize(resultatDetailA.result.reviews[0].author_name),
          avatar: resultatDetailA.result.reviews[0].profile_photo_url,
          note: resultatDetailA.result.reviews[0].rating,
          texte: resultatDetailA.result.reviews[0].text,
        },
        {
          auteur: capitalize(resultatDetailA.result.reviews[1].author_name),
          avatar: resultatDetailA.result.reviews[1].profile_photo_url,
          note: resultatDetailA.result.reviews[1].rating,
          texte: resultatDetailA.result.reviews[1].text,
        },
        {
          auteur: capitalize(resultatDetailA.result.reviews[2].author_name),
          avatar: resultatDetailA.result.reviews[2].profile_photo_url,
          note: resultatDetailA.result.reviews[2].rating,
          texte: resultatDetailA.result.reviews[2].text,
        },
      ],
      photo: rawPhotoResultA.url,
    };

    //Objet résultat pour Front 2
    var suggestionB = {
      place_id: randomTypeB.place_id,
      type: formatNames(type[1]),
      nom: capitalize(randomTypeB.name),
      coords: randomTypeB.geometry.location,
      adresse: randomTypeB.vicinity,
      rating: randomTypeB.rating,
      description: descriptionBuild(
        type[1],
        randomTypeB.price_level,
        randomTypeB.rating
      ),
      isOpen: resultatDetailB.result.opening_hours.open_now,
      openingHours: resultatDetailB.result.opening_hours.weekday_text,
      reviews: [
        {
          auteur: capitalize(resultatDetailB.result.reviews[0].author_name),
          avatar: resultatDetailB.result.reviews[0].profile_photo_url,
          note: resultatDetailB.result.reviews[0].rating,
          texte: resultatDetailB.result.reviews[0].text,
        },
        {
          auteur: capitalize(resultatDetailB.result.reviews[1].author_name),
          avatar: resultatDetailB.result.reviews[1].profile_photo_url,
          note: resultatDetailB.result.reviews[1].rating,
          texte: resultatDetailB.result.reviews[1].text,
        },
        {
          auteur: capitalize(resultatDetailB.result.reviews[2].author_name),
          avatar: resultatDetailB.result.reviews[2].profile_photo_url,
          note: resultatDetailB.result.reviews[2].rating,
          texte: resultatDetailB.result.reviews[2].text,
        },
      ],
      photo: rawPhotoResultB.url,
    };

    //Objet résultat pour Front 3
    var suggestionC = {
      place_id: randomTypeC.place_id,
      type: formatNames(type[2]),
      nom: capitalize(randomTypeC.name),
      coords: randomTypeC.geometry.location,
      adresse: randomTypeC.vicinity,
      rating: randomTypeC.rating,
      description: descriptionBuild(
        type[2],
        randomTypeC.price_level,
        randomTypeC.rating
      ),
      isOpen: resultatDetailC.result.opening_hours.open_now,
      openingHours: resultatDetailC.result.opening_hours.weekday_text,
      reviews: [
        {
          auteur: capitalize(resultatDetailC.result.reviews[0].author_name),
          avatar: resultatDetailC.result.reviews[0].profile_photo_url,
          note: resultatDetailC.result.reviews[0].rating,
          texte: resultatDetailC.result.reviews[0].text,
        },
        {
          auteur: capitalize(resultatDetailC.result.reviews[1].author_name),
          avatar: resultatDetailC.result.reviews[1].profile_photo_url,
          note: resultatDetailC.result.reviews[1].rating,
          texte: resultatDetailC.result.reviews[1].text,
        },
        {
          auteur: capitalize(resultatDetailC.result.reviews[2].author_name),
          avatar: resultatDetailC.result.reviews[2].profile_photo_url,
          note: resultatDetailC.result.reviews[2].rating,
          texte: resultatDetailC.result.reviews[2].text,
        },
      ],
      photo: rawPhotoResultC.url,
    };

    // Tableau total des suggestions à renvoyer en Front
    var suggestions = [suggestionA, suggestionB, suggestionC];
  }

  // JSON pour le front
  res.json({ status: "ok", suggestions });
});

module.exports = router;
