const recipes = [
  {
    data: {
      name: 'Test Recipe One',
      ingredients: {
        create: [{ amount: '10.5', ingredient: { connect: { id: 1 } } }],
      },
    },
  },
  {
    data: {
      name: 'Test Recipe Two',
      ingredients: {
        create: [
          { amount: '10', ingredient: { connect: { id: 1 } } },
          { amount: '10', ingredient: { connect: { id: 2 } } },
        ],
      },
    },
  },
];

module.exports = recipes;
