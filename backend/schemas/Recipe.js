const { Text, Relationship, Integer } = require('@keystonejs/fields');

module.exports = {
  adminDoc: 'Recipes to be selected for the schedule',
  fields: {
    name: { type: Text },
    description: { type: Text },
    prepTime: { type: Integer },
    cookTime: { type: Integer },
    calories: { type: Integer },
    ingredients: {
      type: Relationship,
      ref: 'IngredientAddition',
      many: true,
    },
  },
};
