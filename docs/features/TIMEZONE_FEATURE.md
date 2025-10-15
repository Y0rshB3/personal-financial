# 🌍 Configuración de Zona Horaria - Documentación

## Descripción

Sistema de zona horaria personalizada que permite a cada usuario elegir cómo visualizar las fechas en la aplicación.

---

## ✨ Características

### 🌐 Modo Automático
- **Por defecto**: Detecta automáticamente la zona horaria del navegador
- **Ideal para**: Mayoría de usuarios que trabajan desde una ubicación fija
- **Actualización**: Si cambias de ubicación, la app se adapta automáticamente

### 🗺️ Modo Manual
- **19 zonas horarias**: Principales ciudades del mundo
- **Ideal para**: 
  - Expatriados que quieren ver fechas en su país de origen
  - Nómadas digitales que viajan constantemente
  - Usuarios que manejan finanzas en otra zona horaria
  - Equipos distribuidos globalmente

---

## 🎯 Casos de Uso

### Caso 1: Usuario Colombiano Normal
```
Configuración: 🌐 Automática
Ubicación: Bogotá (UTC-5)
Resultado: Fechas en hora de Bogotá
```

### Caso 2: Colombiano Viviendo en España
```
Configuración: 🇨🇴 Bogotá (Manual)
Ubicación física: Madrid (UTC+1)
Resultado: Fechas en hora de Bogotá (útil para ver finanzas de Colombia)
```

### Caso 3: Nómada Digital
```
Configuración: 🌐 Automática
Ubicaciones: México → España → Japón
Resultado: Fechas se ajustan automáticamente a cada país
```

---

## 🔧 Configuración

### Acceder a Configuración
1. Click en **"Configuración"** en el menú lateral
2. Buscar sección **"Perfil de Usuario"**
3. Campo: **"Zona Horaria"**

### Opciones Disponibles

| Zona Horaria | Ubicación | UTC Offset |
|--------------|-----------|------------|
| 🌐 Automática | Detecta del navegador | Variable |
| 🇺🇸 Nueva York | EST/EDT | UTC-5/-4 |
| 🇺🇸 Chicago | CST/CDT | UTC-6/-5 |
| 🇺🇸 Denver | MST/MDT | UTC-7/-6 |
| 🇺🇸 Los Ángeles | PST/PDT | UTC-8/-7 |
| 🇲🇽 Ciudad de México | CST | UTC-6 |
| 🇨🇴 Bogotá | COT | UTC-5 |
| 🇵🇪 Lima | PET | UTC-5 |
| 🇨🇱 Santiago | CLT/CLST | UTC-4/-3 |
| 🇦🇷 Buenos Aires | ART | UTC-3 |
| 🇧🇷 São Paulo | BRT/BRST | UTC-3/-2 |
| 🇬🇧 Londres | GMT/BST | UTC+0/+1 |
| 🇫🇷 París | CET/CEST | UTC+1/+2 |
| 🇪🇸 Madrid | CET/CEST | UTC+1/+2 |
| 🇩🇪 Berlín | CET/CEST | UTC+1/+2 |
| 🇯🇵 Tokio | JST | UTC+9 |
| 🇨🇳 Shanghái | CST | UTC+8 |
| 🇦🇪 Dubái | GST | UTC+4 |
| 🇦🇺 Sídney | AEDT/AEST | UTC+11/+10 |

---

## 🔄 Flujo Técnico

### 1. Backend (Base de Datos)
```
Almacenamiento: UTC estándar
Campo: timestamp with time zone
Ejemplo: 2025-10-08T17:00:00Z
```

### 2. Frontend (Configuración)
```javascript
// Usuario elige en Settings
timezone: 'America/Bogota'  // Manual
timezone: 'auto'            // Automático
```

### 3. Visualización
```javascript
// Si es 'auto'
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Si es manual
const timezone = user.timezone;

// Formatear
date.toLocaleDateString('es-ES', { timeZone: timezone });
```

---

## 📋 Instalación

### 1. Ejecutar Migración
```bash
cd backend
node src/scripts/migrate-timezone.js
```

### 2. Verificar en Base de Datos
```bash
docker exec -it personal-finance-postgres psql -U postgres -d personal_finance

# Verificar columna
\d users
SELECT id, name, timezone FROM users LIMIT 5;
\q
```

### 3. Reiniciar Backend (si está corriendo)
```bash
docker-compose restart backend
# O sin Docker
npm run dev
```

### 4. Probar en Frontend
1. Ir a **http://localhost:3000/settings**
2. Cambiar **Zona Horaria**
3. Guardar
4. Verificar que fechas se actualizan

---

## 🧪 Pruebas

### Prueba 1: Modo Automático
1. Configurar: **🌐 Automática**
2. Crear transacción: **08/10/2025**
3. Verificar que se muestra: **08/10/2025**

### Prueba 2: Cambiar Zona Horaria
1. Crear transacción en **Bogotá** (UTC-5): **08/10/2025 10:00**
2. Cambiar a **Tokio** (UTC+9): Ver fecha ajustada
3. La fecha debe seguir mostrando el día correcto

### Prueba 3: Multi-Usuario
- Usuario 1 (Colombia) ve: **08/10/2025**
- Usuario 2 (España) ve: **08/10/2025**
- Usuario 3 (Japón) ve: **08/10/2025**
- **Todos ven la misma fecha** ✅

---

## 💡 Beneficios

### Para Usuarios
- ✅ **Flexibilidad**: Elige cómo ver tus fechas
- ✅ **Viajes**: Automático se adapta donde estés
- ✅ **Multi-país**: Maneja finanzas de varios países
- ✅ **Equipos globales**: Cada quien ve en su hora

### Para Desarrolladores
- ✅ **Estándar UTC**: Base de datos consistente
- ✅ **Escalable**: Funciona en cualquier parte del mundo
- ✅ **Mantenible**: Lógica centralizada
- ✅ **Sin bugs de zona horaria**: JavaScript nativo

---

## 🔐 Consideraciones de Seguridad

1. **Validación**: Solo zonas horarias válidas IANA
2. **Default seguro**: `auto` si hay error
3. **Sin exposición**: Zona horaria no es dato sensible
4. **Auditoría**: Se puede trackear cambios si se necesita

---

## 📊 Impacto en Funcionalidades

### ✅ Afectadas Positivamente
- Transacciones (tabla y formulario)
- Dashboard (transacciones recientes)
- Gastos Esperados (fechas pendientes)
- Reportes (exportación con fechas correctas)

### ❌ No Afectadas
- Montos de dinero
- Categorías
- Usuarios
- Autenticación

---

## 🚀 Próximas Mejoras

- [ ] Agregar más zonas horarias bajo demanda
- [ ] Mostrar offset UTC en el selector
- [ ] Guardar historial de cambios de zona horaria
- [ ] Alertas inteligentes según zona horaria
- [ ] Comparativa multi-zona en reportes

---

## 🐛 Solución de Problemas

### Problema: Fechas siguen mostrando mal
**Solución**:
1. Verificar que la columna timezone existe en users
2. Ejecutar migración: `node src/scripts/migrate-timezone.js`
3. Limpiar caché del navegador
4. Recargar la página

### Problema: Zona horaria no se guarda
**Solución**:
1. Verificar que el endpoint `/api/auth/profile` acepta `timezone`
2. Revisar logs del backend
3. Verificar permisos de actualización

### Problema: "Invalid timezone"
**Solución**:
1. Solo usar zonas del selector
2. Si es automático, debe ser `'auto'`
3. Verificar que el string sea exacto (case-sensitive)

---

## 📚 Referencias

- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [PostgreSQL: Timestamp with Time Zone](https://www.postgresql.org/docs/current/datatype-datetime.html)

---

## ✅ Checklist de Implementación

- [x] Agregar campo timezone al modelo User
- [x] Crear migración de base de datos
- [x] Agregar selector en Settings
- [x] Actualizar formatDate en Transactions
- [x] Actualizar formatDate en Dashboard
- [x] Actualizar formatDate en ExpectedExpenses
- [x] Guardar preferencia en backend
- [x] Mostrar zona detectada cuando es auto
- [x] Validar zonas horarias válidas
- [x] Documentación completa
- [ ] Ejecutar migración en producción

---

**¡Sistema de zona horaria personalizada implementado exitosamente!** 🌍🎉
