const recipeSchema = require('./Recipe');
const ingredientSchema = require('./Ingredient');
const unitOfMeasure = require('./UnitOfMeasure');

function addSchemas(keystone) {
  keystone.createList('UnitOfMeasure', unitOfMeasure);
  keystone.createList('Ingredient', ingredientSchema);
  keystone.createList('Recipe', recipeSchema);
}

module.exports = addSchemas;
