const User = require('./User');
const Category = require('./Category');
const Transaction = require('./Transaction');
const ExpectedExpense = require('./ExpectedExpense');

// Define relationships
User.hasMany(Category, { foreignKey: 'userId', as: 'categories', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Transaction, { foreignKey: 'categoryId', as: 'transactions', onDelete: 'RESTRICT' });
Transaction.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(ExpectedExpense, { foreignKey: 'userId', as: 'expectedExpenses', onDelete: 'CASCADE' });
ExpectedExpense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(ExpectedExpense, { foreignKey: 'categoryId', as: 'expectedExpenses', onDelete: 'RESTRICT' });
ExpectedExpense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Transaction.hasOne(ExpectedExpense, { foreignKey: 'transactionId', as: 'expectedExpense' });
ExpectedExpense.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

module.exports = {
  User,
  Category,
  Transaction,
  ExpectedExpense
};
