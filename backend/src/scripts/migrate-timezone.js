const { sequelize } = require('../config/postgres');
const { QueryTypes } = require('sequelize');

/**
 * Script de migración para agregar campo timezone a users
 * Ejecutar con: node src/scripts/migrate-timezone.js
 */

async function migrate() {
  try {
    console.log('🔄 Iniciando migración de timezone...');

    // Verificar si la columna ya existe
    const [columns] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'users' 
       AND column_name = 'timezone';`,
      { type: QueryTypes.SELECT }
    );

    if (columns) {
      console.log('ℹ️  La columna timezone ya existe');
      process.exit(0);
    }

    // Agregar columna timezone
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN timezone VARCHAR(50) DEFAULT 'auto';
    `);

    console.log('✅ Columna timezone agregada a la tabla users');

    // Actualizar usuarios existentes
    await sequelize.query(`
      UPDATE users 
      SET timezone = 'auto' 
      WHERE timezone IS NULL;
    `);

    console.log('✅ Usuarios existentes actualizados con timezone = auto');

    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrate();
