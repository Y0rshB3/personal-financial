# 📅 Gastos Esperados - Documentación

## Descripción

Sistema de gestión de **gastos esperados** que permite planificar gastos futuros y convertirlos automáticamente en transacciones reales cuando se realizan.

## Características

### ✨ Funcionalidades Principales

- **Creación de gastos esperados**: Define gastos que planeas realizar en el futuro
- **Conversión automática**: Al marcar como "completado", se crea automáticamente una transacción de gasto
- **Estados**: Pendiente o Completado
- **Recurrencia Automática**: 🔄 Gastos recurrentes se crean automáticamente al completar (diaria, semanal, mensual, anual)
- **Alertas visuales**: Resalta gastos vencidos en rojo
- **Estadísticas**: Dashboard con métricas de gastos pendientes y completados

### 🎯 Flujo de Trabajo

1. **Crear gasto esperado**
   - Nombre, monto, categoría, fecha esperada
   - Opcionalmente: descripción, moneda, recurrencia

2. **Seguimiento**
   - Ver todos los gastos esperados pendientes
   - Dashboard muestra próximos gastos vencidos
   - Filtrar por estado (pendiente/completado)

3. **Completar gasto**
   - Hacer clic en el botón "Completar" (✓)
   - Se crea automáticamente una transacción de gasto
   - El gasto esperado cambia a estado "completado"
   - Se registra la fecha de completado y el ID de transacción
   - **Si tiene recurrencia**: Se crea automáticamente el siguiente gasto esperado 🔄

### 🔄 Recurrencia Automática

Cuando marcas como completado un gasto esperado con recurrencia, **automáticamente**:

1. ✅ Se crea la transacción en "Transacciones"
2. ✅ El gasto actual pasa a "Completado"
3. 🔄 **Se crea el siguiente gasto esperado** con:
   - Mismo nombre, monto, categoría
   - **Nueva fecha** calculada según recurrencia
   - Estado: Pendiente

**Ejemplo - Gasto Mensual**:
```
Gasto: "Renta" - $1000 - Mensual - Fecha: 01/10/2025
Usuario marca como completado ✓

Resultado:
1. Transacción creada: "Renta" - $1000 - 01/10/2025
2. Gasto actual: Completado
3. Nuevo gasto creado: "Renta" - $1000 - Mensual - 01/11/2025 (Pendiente)
```

**Tipos de Recurrencia**:
- **Diaria**: Siguiente día
- **Semanal**: +7 días
- **Mensual**: Mismo día del próximo mes
- **Anual**: Mismo día del próximo año
- **Sin recurrencia**: No se crea siguiente gasto

---

## 📡 API Endpoints

### Listar gastos esperados
```bash
GET /api/expected-expenses
GET /api/expected-expenses?status=pending
GET /api/expected-expenses?status=completed
GET /api/expected-expenses?categoryId=UUID
GET /api/expected-expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Obtener un gasto esperado
```bash
GET /api/expected-expenses/:id
```

### Crear gasto esperado
```bash
POST /api/expected-expenses
Content-Type: application/json

{
  "name": "Pago de renta",
  "amount": 1000,
  "currency": "USD",
  "categoryId": "uuid-categoria",
  "description": "Renta del mes",
  "expectedDate": "2024-11-01",
  "recurrence": "monthly"
}
```

### Actualizar gasto esperado
```bash
PUT /api/expected-expenses/:id
Content-Type: application/json

{
  "amount": 1100,
  "expectedDate": "2024-11-05"
}
```

**Nota**: No se pueden actualizar gastos ya completados.

### Eliminar gasto esperado
```bash
DELETE /api/expected-expenses/:id
```

### Marcar como completado (crear transacción)
```bash
POST /api/expected-expenses/:id/complete
Content-Type: application/json

{
  "amount": 1000,      // Opcional, usa el monto del gasto esperado
  "currency": "USD",   // Opcional
  "description": "",   // Opcional
  "date": "2024-10-14" // Opcional, usa fecha actual
}
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "expectedExpense": { ... },
    "transaction": { ... }
  }
}
```

### Estadísticas
```bash
GET /api/expected-expenses/stats
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 5,
    "completed": 5,
    "totalAmount": 5000,
    "pendingAmount": 2500,
    "completedAmount": 2500
  }
}
```

---

## 🗄️ Modelo de Datos

### Tabla: `expected_expenses`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | VARCHAR(255) | Nombre del gasto esperado |
| amount | DECIMAL(10,2) | Monto esperado |
| currency | VARCHAR(3) | Moneda (USD, EUR, etc.) |
| description | TEXT | Descripción adicional |
| expectedDate | TIMESTAMP | Fecha en que se espera realizar el gasto |
| status | ENUM | 'pending' o 'completed' |
| completedDate | TIMESTAMP | Fecha en que se marcó como completado |
| recurrence | ENUM | 'none', 'daily', 'weekly', 'monthly', 'yearly' |
| tags | VARCHAR[] | Etiquetas adicionales |
| userId | UUID | FK a users |
| categoryId | UUID | FK a categories |
| transactionId | UUID | FK a transactions (cuando se completa) |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Fecha de última actualización |

### Relaciones

- **User** → hasMany → **ExpectedExpense**
- **Category** → hasMany → **ExpectedExpense**
- **Transaction** ← hasOne ← **ExpectedExpense** (cuando se completa)

---

## 🚀 Instalación y Migración

### 1. Ejecutar migración de base de datos

```bash
cd backend
node src/scripts/migrate-expected-expenses.js
```

### 2. Reiniciar servidor (si está corriendo)

```bash
# Con Docker
docker-compose restart backend

# Sin Docker
npm run dev
```

### 3. Verificar tabla creada

```bash
# PostgreSQL CLI
docker exec -it personal-finance-postgres psql -U postgres -d personal_finance

# Verificar tabla
\d expected_expenses
SELECT * FROM expected_expenses;
\q
```

---

## 💻 Uso en Frontend

### Página de Gastos Esperados

Navegar a: **http://localhost:3000/expected-expenses**

### Desde el Dashboard

Los gastos esperados pendientes aparecen automáticamente en el dashboard con:
- ❗ Resaltado en rojo si están vencidos
- Icono de alerta para gastos vencidos
- Link directo a la página de gastos esperados

### Acciones disponibles

1. **➕ Crear nuevo**: Botón verde "Nuevo Gasto Esperado"
2. **✓ Completar**: Marca como realizado y crea transacción
3. **✏️ Editar**: Solo para gastos pendientes
4. **🗑️ Eliminar**: Elimina el gasto esperado

---

## 🔧 Casos de Uso

### Ejemplo 1: Renta mensual

```json
{
  "name": "Pago de renta",
  "amount": 1000,
  "categoryId": "housing-category-uuid",
  "expectedDate": "2024-11-01",
  "recurrence": "monthly"
}
```

### Ejemplo 2: Suscripción anual

```json
{
  "name": "Renovación Netflix",
  "amount": 120,
  "categoryId": "entertainment-category-uuid",
  "expectedDate": "2025-01-15",
  "recurrence": "yearly"
}
```

### Ejemplo 3: Gasto único

```json
{
  "name": "Compra de laptop",
  "amount": 1500,
  "categoryId": "technology-category-uuid",
  "expectedDate": "2024-12-01",
  "recurrence": "none"
}
```

---

## 🎨 Características de UI

### Dashboard
- Widget de gastos esperados pendientes
- Indicador visual de gastos vencidos
- Link rápido a la página completa

### Página de Gastos Esperados
- Tabla con todos los gastos
- Filtros por estado (todos, pendientes, completados)
- Badges de estado con colores
- Cards de estadísticas
- Resaltado rojo para gastos vencidos
- Botones de acción contextuales

### Formulario
- Validación en tiempo real
- Solo categorías de tipo "expense"
- Selector de recurrencia
- Soporte multi-moneda

---

## 🔐 Seguridad

- ✅ Todas las rutas protegidas con JWT
- ✅ Validación userId en todas las operaciones
- ✅ No se pueden editar gastos completados
- ✅ Validaciones de monto positivo
- ✅ Cascada en eliminación de usuario
- ✅ Restricción en eliminación de categoría

---

## 📊 Logs y Auditoría

Todas las operaciones se registran en MongoDB:

- `create_expected_expense`
- `update_expected_expense`
- `delete_expected_expense`
- `complete_expected_expense`

Ver logs:
```bash
docker exec -it personal-finance-mongodb mongosh personal_finance_logs \
  --eval "db.activitylogs.find({action: /expected_expense/}).sort({timestamp:-1}).limit(10).pretty()"
```

---

## 🐛 Solución de Problemas

### Tabla no existe

```bash
# Ejecutar migración manualmente
node src/scripts/migrate-expected-expenses.js
```

### Error de relaciones

```bash
# Verificar que las tablas users, categories y transactions existan
docker exec -it personal-finance-postgres psql -U postgres -d personal_finance -c "\dt"
```

### Frontend no carga gastos esperados

1. Verificar que el backend esté corriendo
2. Revisar consola del navegador para errores
3. Verificar que el endpoint `/api/expected-expenses` responda:
   ```bash
   curl http://localhost:5000/api/expected-expenses \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 🚀 Próximas Mejoras

- [ ] Notificaciones antes de la fecha esperada
- [ ] Auto-completar gastos recurrentes
- [ ] Exportar gastos esperados a Excel
- [ ] Gráficas de proyección de gastos
- [ ] Recordatorios por email
- [ ] Sincronización con calendario

---

## 📝 Notas

- Los gastos esperados **solo son de tipo expense**, no hay ingresos esperados
- Al completar un gasto, se puede ajustar el monto real vs el esperado
- La recurrencia es informativa, no crea automáticamente nuevos gastos
- Los gastos completados mantienen su referencia a la transacción creada
