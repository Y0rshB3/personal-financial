const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgres');

const ExpectedExpense = sequelize.define('ExpectedExpense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es requerido' }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El monto debe ser positivo' }
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  description: {
    type: DataTypes.TEXT
  },
  expectedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'La fecha esperada es requerida' }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending'
  },
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  recurrence: {
    type: DataTypes.ENUM('none', 'daily', 'weekly', 'monthly', 'yearly'),
    defaultValue: 'none'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'transactions',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'ID de la transacción creada cuando se marca como completado'
  }
}, {
  tableName: 'expected_expenses',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'expectedDate']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['status', 'expectedDate']
    }
  ]
});

module.exports = ExpectedExpense;
