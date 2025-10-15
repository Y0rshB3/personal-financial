const { sequelize } = require('../config/postgres');
const { QueryTypes } = require('sequelize');

/**
 * Script de migración para crear la tabla expected_expenses
 * Ejecutar con: node src/scripts/migrate-expected-expenses.js
 */

async function migrate() {
  try {
    console.log('🔄 Iniciando migración de expected_expenses...');

    // Verificar si la tabla ya existe
    const [tables] = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'expected_expenses'
      );`,
      { type: QueryTypes.SELECT }
    );

    if (tables.exists) {
      console.log('ℹ️  La tabla expected_expenses ya existe');
      process.exit(0);
    }

    // Crear la tabla
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS expected_expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
        currency VARCHAR(3) DEFAULT 'USD',
        description TEXT,
        "expectedDate" TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
        "completedDate" TIMESTAMP,
        recurrence VARCHAR(20) DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
        tags VARCHAR(255)[],
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "categoryId" UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        "transactionId" UUID REFERENCES transactions(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Tabla expected_expenses creada');

    // Crear índices
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_expected_expenses_user_date 
      ON expected_expenses("userId", "expectedDate");
    `);
    console.log('✅ Índice userId + expectedDate creado');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_expected_expenses_user_status 
      ON expected_expenses("userId", status);
    `);
    console.log('✅ Índice userId + status creado');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_expected_expenses_status_date 
      ON expected_expenses(status, "expectedDate");
    `);
    console.log('✅ Índice status + expectedDate creado');

    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrate();
