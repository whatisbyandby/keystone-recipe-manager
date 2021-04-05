const { createItems } = require('@keystonejs/server-side-graphql-client');
const recipes = require('./initialRecipes');
const ingredients = require('./ingredients');

async function createIngredients(keystone) {
  await createItems({
    keystone,
    listKey: 'Ingredient',
    items: ingredients,
    returnValues: `id`,
  });
}

async function createRecipes(keystone) {
  await createItems({
    keystone,
    listKey: 'Recipe',
    items: recipes,
    returnValues: `id`,
  });
}

module.exports = async (keystone) => {
  // Count existing users
  const {
    data: {
      _allUsersMeta: { count = 0 },
    },
  } = await keystone.executeGraphQL({
    context: keystone.createContext().sudo(),
    query: `query {
      _allUsersMeta {
        count
      }
    }`,
  });

  if (count === 0) {
    const password = 'TestPass@1234!';
    const email = 'admin@perkylab.com';

    const { errors } = await keystone.executeGraphQL({
      context: keystone.createContext().sudo(),
      query: `mutation initialUser($password: String, $email: String) {
            createUser(data: {name: "Admin", email: $email, isAdmin: true, password: $password}) {
              id
            }
          }`,
      variables: { password, email },
    });

    if (errors) {
      console.log('failed to create initial user:');
      console.log(errors);
    } else {
      console.log(`

      User created:
        email: ${email}
        password: ${password}
      Please change these details after initial login.
      `);
    }
  }
  await createIngredients(keystone);
  await createRecipes(keystone);
};
