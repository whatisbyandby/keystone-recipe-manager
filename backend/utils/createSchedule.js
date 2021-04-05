const {
  getItems,
  createItem,
} = require('@keystonejs/server-side-graphql-client');
const { Client } = require('pg');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const createSchedule = async (keystone) => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'meal_planner',
    password: 'postgres',
    port: 5432,
  });

  client.connect();
  const countResult = await client.query('SELECT COUNT(*) FROM "Recipe";');
  client.end();
  const count = parseInt(countResult.rows[0].count);

  const idSet = new Set();

  for (let i = 1; i < 5; i++) {
    idSet.add(getRandomInt(1, count));
  }

  const results = await getItems({
    keystone,
    listKey: 'Recipe',
    returnFields: `
    id 
    name 
    ingredients {
      amount
      ingredient {
        id
        name
      }
    }`,
  });

  const shoppingList = createShoppingList(results);

  const schedule = {
    user: {
      connect: { id: 1 },
    },
    recipes: {
      connect: [{ id: 1 }],
    },
    shoppingList: shoppingList, //{

    // create: {
    //   items: {
    //     create: [
    //       { amount: '1', ingredient: { connect: { id: 1 } } },
    //       { amount: '2', ingredient: { connect: { id: 2 } } },
    //     ],
    //   },
    // },
    //},
  };
  makeSchedule(keystone, schedule);
};

const makeSchedule = async (keystone, newSchedule) => {
  const schedule = await createItem({
    keystone,
    listKey: 'Schedule',
    item: newSchedule,
    returnFields: `
    recipes {
        id 
        name 
    }
    shoppingList {
      items {
       amount
       ingredient {
         name
       }
      }
    }`,
  });

  console.log(schedule.shoppingList.items);
};

function aggregateIngredientAdditions(recipeList) {
  const aggrigatedList = new Map();
  recipeList.forEach((recipe) => {
    const { ingredients } = recipe;
    ingredients.forEach((ingredientAddition) => {
      const { ingredient } = ingredientAddition;
      if (aggrigatedList.has(ingredientAddition.ingredient.name)) {
        const updatedIngredient = aggrigatedList.get(ingredient.name);
        updatedIngredient.amount = (
          parseFloat(updatedIngredient.amount) +
          parseFloat(ingredientAddition.amount)
        ).toString();
        aggrigatedList.set(
          updatedIngredient.ingredient.name,
          updatedIngredient
        );
      } else {
        aggrigatedList.set(
          ingredientAddition.ingredient.name,
          ingredientAddition
        );
      }
    });
  });
  return aggrigatedList;
}

function createShoppingList(recipeList) {
  const shoppingList = [];

  const aggrigatedList = aggregateIngredientAdditions(recipeList);
  aggrigatedList.forEach((item) => {
    shoppingList.push({
      amount: item.amount,
      ingredient: { connect: { id: item.ingredient.id } },
    });
  });

  return { create: { items: { create: shoppingList } } };
}

module.exports = createSchedule;
