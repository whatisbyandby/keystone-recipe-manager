const { Keystone } = require('@keystonejs/keystone');
const { getItem } = require('@keystonejs/server-side-graphql-client');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const addSchemas = require('./schemas/addSchemas');

const {
  Text,
  Checkbox,
  Password,
  Relationship,
  Select,
  Decimal,
} = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const initialiseData = require('./seed_data/initial-data');
const scheduler = require('./utils/schedule');

const { KnexAdapter: Adapter } = require('@keystonejs/adapter-knex');
const PROJECT_NAME = 'meal-planner';
const adapterConfig = {
  dropDatabase: true,
  knexOptions: {
    connection: 'postgres://postgres:postgres@localhost:5432/meal_planner',
  },
};

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  onConnect: () => {
    if (process.env.CREATE_TABLES !== 'true') {
      initialiseData(keystone);
    }
    scheduler(keystone);
  },
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) =>
  Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = (auth) => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };
addSchemas(keystone);

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  //List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
});

keystone.createList('Schedule', {
  fields: {
    recipes: { type: Relationship, ref: 'Recipe', many: true },
    user: { type: Relationship, ref: 'User', many: false },
    shoppingList: { type: Relationship, ref: 'ShoppingList', many: false },
  },
});

keystone.createList('ShoppingList', {
  fields: {
    items: { type: Relationship, ref: 'IngredientAddition', many: true },
  },
});

keystone.createList('IngredientAddition', {
  fields: {
    amount: { type: Decimal },
    unitOfMeasure: { type: Relationship, ref: 'UnitOfMeasure', many: false },
    ingredient: {
      type: Relationship,
      ref: 'Ingredient',
      many: false,
    },
  },
  labelResolver: async (item) => {
    const ingredient = await getItem({
      keystone,
      listKey: 'Ingredient',
      itemId: item.ingredient,
      returnFields: 'name',
    });
    return ingredient.name;
  },
});

keystone.createList('Department', {
  fields: {
    name: { type: Text },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: { protectIdentities: process.env.NODE_ENV === 'production' },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
