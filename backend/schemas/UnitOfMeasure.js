const { Text, Select, Decimal } = require('@keystonejs/fields');

module.exports = {
  fields: {
    name: { type: Text },
    abbreviation: { type: Text },
    type: { type: Select, options: 'weight, volume, units, package' },
    conversionFactor: { type: Decimal },
  },
};
