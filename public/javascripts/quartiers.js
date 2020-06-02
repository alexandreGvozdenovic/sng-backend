const rawQuartiers = require('../files/quartiers.json');

let quartiers = [];
rawQuartiers.map((q) => {
    quartiers.push({
        nom:q.fields.l_qu,
        coords:q.fields.geom_x_y,
    })
})

quartiers = quartiers.sort((a,b) => {
    // console.log(a.nom)
    if(a.nom < b.nom) { return -1;}
    if(a.nom > b.nom) { return 1; }
    return 0;
} );

exports.quartiers = quartiers