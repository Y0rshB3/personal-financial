# Arquitectura Híbrida del Sistema

## 🏗️ Visión General

Este proyecto utiliza una **arquitectura híbrida de bases de datos** que combina PostgreSQL y MongoDB para optimizar el rendimiento y aprovechar las fortalezas de cada tecnología.

## 📊 Distribución de Datos

### PostgreSQL (Base de Datos Principal)
**Responsabilidad**: Datos críticos, transaccionales y relacionales

#### Tablas:
- **users** - Información de usuarios y autenticación
- **transactions** - Transacciones financieras (ACID required)
- **categories** - Categorías de ingresos/gastos

#### Por qué PostgreSQL:
- ✅ **Integridad referencial** con foreign keys
- ✅ **Transacciones ACID** para operaciones financieras
- ✅ **Relaciones complejas** entre entidades
- ✅ **Consultas relacionales** eficientes
- ✅ **Auditoría y compliance** más robusto

### MongoDB (Base de Datos Secundaria)
**Responsabilidad**: Datos no estructurados, logs y operaciones de alto volumen

#### Colecciones:
- **activitylogs** - Registro de actividades del usuario
- **processedfiles** - Archivos PDF procesados y datos extraídos
- **emailqueues** - Cola de emails pendientes de envío
- **userpreferences** - Preferencias y configuraciones personalizadas

#### Por qué MongoDB:
- ✅ **Esquema flexible** para datos no estructurados
- ✅ **Alto rendimiento** en escritura (logs)
- ✅ **TTL indexes** para auto-limpieza de logs antiguos
- ✅ **Escalabilidad horizontal** más sencilla
- ✅ **Almacenamiento de documentos** complejos (PDFs procesados)

## 🔄 Flujo de Datos

### Autenticación (PostgreSQL)
```
Usuario → Login → PostgreSQL (validar) → JWT Token
                ↓
              MongoDB (log de login)
```

### Creación de Transacción
```
Usuario → Nueva Transacción → PostgreSQL (guardar)
                            ↓
                          MongoDB (log de actividad)
```

### Procesamiento de PDF
```
Usuario → Upload PDF → MongoDB (guardar archivo)
                    ↓
                  Procesar → Extraer datos
                    ↓
                  PostgreSQL (crear transacciones)
                    ↓
                  MongoDB (actualizar estado del archivo)
```

### Reportes
```
Usuario → Solicitar reporte → PostgreSQL (obtener transacciones)
                           ↓
                         Generar Excel/PDF
                           ↓
                         MongoDB (encolar email)
```

## 🔌 Conexiones

### PostgreSQL
```javascript
// Sequelize ORM
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
```

### MongoDB
```javascript
// Mongoose ODM
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

## 📦 Modelos

### PostgreSQL (Sequelize)
```
backend/src/models/postgres/
├── User.js
├── Category.js
├── Transaction.js
└── index.js (relationships)
```

### MongoDB (Mongoose)
```
backend/src/models/mongodb/
├── ActivityLog.js
├── ProcessedFile.js
├── EmailQueue.js
└── UserPreferences.js
```

## 🔍 Consultas Típicas

### Obtener transacciones con categoría (PostgreSQL)
```javascript
const transactions = await Transaction.findAll({
  where: { userId: user.id },
  include: [{ model: Category, as: 'category' }],
  order: [['date', 'DESC']]
});
```

### Registrar actividad (MongoDB)
```javascript
await ActivityLog.create({
  userId: user.id,
  action: 'create_transaction',
  details: { transactionId, amount }
});
```

## 🚀 Ventajas de esta Arquitectura

1. **Mejor rendimiento**: Cada DB hace lo que mejor sabe hacer
2. **Escalabilidad**: MongoDB escala logs, PostgreSQL mantiene consistencia
3. **Flexibilidad**: Fácil agregar nuevos tipos de datos no estructurados
4. **Resiliencia**: Si una DB falla, la otra mantiene operaciones críticas
5. **Costos optimizados**: Distribuye carga según necesidades

## ⚠️ Consideraciones

### Complejidad
- Dos sistemas de DB requieren más conocimiento del equipo
- Dos conexiones a mantener
- Backups separados

### Sincronización
- El `userId` en MongoDB es string (UUID de PostgreSQL)
- Importante mantener consistencia en IDs
- No hay foreign keys entre DBs (gestión manual)

### Transacciones Distribuidas
- No hay transacciones ACID entre PostgreSQL y MongoDB
- Implementar patrones de compensación si es necesario
- Logs pueden quedar inconsistentes en caso de fallo

## 🛠️ Mantenimiento

### Backups
```bash
# PostgreSQL
pg_dump personal_finance > backup.sql

# MongoDB
mongodump --db personal_finance_logs --out backup/
```

### Limpieza de Logs (Automática)
MongoDB tiene TTL index en ActivityLog:
```javascript
// Elimina logs > 90 días automáticamente
ActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
```

## 📈 Escalabilidad Futura

### PostgreSQL
- Read replicas para reportes
- Particionamiento de tablas grandes
- Connection pooling optimizado

### MongoDB
- Sharding para logs de alto volumen
- Índices geoespaciales si se necesita
- Agregaciones para analytics

## 🔒 Seguridad

Ambas bases de datos están:
- Aisladas en red privada (Docker network)
- Con credenciales en variables de entorno
- Sin acceso directo desde internet
- Solo accesibles a través del backend

## 📊 Monitoreo

Métricas clave a monitorear:
- **PostgreSQL**: Transacciones/seg, conexiones activas, query time
- **MongoDB**: Escrituras/seg, tamaño de colecciones, índices usados
- **Aplicación**: Latencia entre DBs, errores de sincronización

---

Esta arquitectura proporciona la **robustez de PostgreSQL** para datos financieros críticos y la **flexibilidad de MongoDB** para operaciones de alto volumen y datos no estructurados.
