const { Text, Relationship, Decimal } = require('@keystonejs/fields');

module.exports = {
  fields: {
    name: { type: Text, isUnique: true, isRequired: true },
    unitsPerPurchase: { type: Decimal },
    unitOfMeasure: { type: Relationship, ref: 'UnitOfMeasure', many: false },
    department: { type: Relationship, ref: 'Department', many: false },
  },
};
