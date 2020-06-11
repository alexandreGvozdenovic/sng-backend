// donne un élément au hasard 
function randomizer(liste) {
    var x = liste.length - 1;
    var random = Math.round(Math.random(Math.floor())*x);
    return liste[random];
  }

module.exports = function descriptionBuild(type,priceLevel,rating) {
    type = type === 'night_club' ? type.replace('night_club', 'club') : type;

    let accroche = [
        `Ce ${type} est une des perles du quartier. L'ambiance y est très agréable.`,
        `En choisissant ce ${type}, tu ne feras pas d'erreur.`,
        `Si cette soirée compte pour toi, cours te rendre dans ce ${type}.`,
        `Ne passes pas à côté de ce ${type}. Tu le regretterais...`,
        `Un ${type} comme on en fait peu. Si tu as envie de faire une découverte.`,
        `Ce ${type} est une institution dans le quartier.`,
        `Un chouette ${type} qui pourrait vite devenir votre ${type} préféré du coin.`
    ]
    let niveauDePrix = [
        `Des tous petits prix pour un très grand moment !`,
        `Les prix y sont ultra abordables !`,
        `Et en plus on y pratique des prix très honnêtes.`,
        `Pas pour toutes les bourses... mais on ne vit qu'une fois !`,
        `Cher ? Oui peut-être un peu. Mais quand on aime...`,
    ];

    let tonalite = rating > 4.5 ? 'Regarde les commentaires; ils sont dithyrambiques !' 
    : rating > 4 ? 'Et si tu veux une preuve, regarde les commentaires !' : ''

    let description = priceLevel ? `${randomizer(accroche)} ${niveauDePrix[priceLevel]} ${tonalite}`:
    `${randomizer(accroche)} ${tonalite}`
    return description
};
