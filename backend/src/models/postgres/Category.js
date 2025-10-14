const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgres');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor ingrese un nombre de categoría' }
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📁'
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6'
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'type']
    }
  ]
});

module.exports = Category;
