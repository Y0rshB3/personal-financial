# 🤖 Configuración de OpenAI para Análisis Inteligente de PDFs

## 📋 ¿Para qué sirve?

La integración con OpenAI GPT-4 permite que el sistema **analice automáticamente cualquier formato de PDF bancario** sin necesidad de programar patrones específicos para cada banco.

### **Ventajas de usar IA:**
- ✅ Detecta transacciones en **cualquier formato** de estado de cuenta
- ✅ Entiende diferentes estructuras de PDFs (columnas, tablas, texto libre)
- ✅ Identifica automáticamente fechas en múltiples formatos
- ✅ Extrae montos incluso sin símbolos de moneda
- ✅ Diferencia entre transacciones, totales y texto irrelevante
- ✅ **Aprende y mejora** con cada análisis

### **Sin OpenAI (Fallback):**
- 📝 Usa expresiones regulares (regex) mejoradas
- ⚠️ Solo detecta formatos específicos programados
- ⚠️ Puede fallar con PDFs de bancos no contemplados

---

## 🔑 Obtener API Key de OpenAI

### **Paso 1: Crear cuenta en OpenAI**

1. Ve a: https://platform.openai.com/signup
2. Regístrate con tu email o cuenta de Google/Microsoft
3. Verifica tu email

### **Paso 2: Agregar método de pago**

1. Ve a: https://platform.openai.com/account/billing
2. Click en "Add payment method"
3. Agrega una tarjeta de crédito/débito
4. OpenAI da **$5 USD gratis** para nuevas cuentas

### **Paso 3: Crear API Key**

1. Ve a: https://platform.openai.com/api-keys
2. Click en "Create new secret key"
3. Dale un nombre: `Personal Finance App`
4. **COPIA LA KEY** (solo se muestra una vez)
5. Formato: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚙️ Configurar en el Proyecto

### **Método 1: Variable de entorno (Recomendado)**

```bash
cd /home/y0rshb3/Desktop/personal-financial/backend

# Editar .env
nano .env

# Agregar la línea:
OPENAI_API_KEY=sk-proj-tu-key-aqui

# Guardar (Ctrl+O, Enter, Ctrl+X)

# Reiniciar backend
npm run dev
```

### **Método 2: Docker**

Si usas Docker, agrega la variable en `docker-compose.yml`:

```yaml
backend:
  environment:
    - OPENAI_API_KEY=sk-proj-tu-key-aqui
```

O mejor aún, en `backend/.env` y Docker lo leerá automáticamente.

---

## 💰 Costos de OpenAI

### **Modelo usado:** GPT-4 Turbo
- **Input**: $0.01 por 1,000 tokens (~750 palabras)
- **Output**: $0.03 por 1,000 tokens

### **Estimación por PDF:**
- PDF típico de 1-3 páginas: ~$0.01 - $0.03 por análisis
- 100 PDFs al mes: ~$1 - $3 USD

### **Créditos gratuitos:**
- **$5 USD gratis** para nuevas cuentas
- Válido por 3 meses
- Suficiente para ~150-500 análisis de PDFs

---

## 🧪 Verificar que funciona

### **1. Ver logs del backend**

Cuando subas un PDF, deberías ver en la consola:

```bash
🤖 Analizando PDF con IA (OpenAI GPT)...
✅ IA detectó 12 transacciones
```

Si no hay API key configurada:
```bash
📝 Analizando PDF con regex (sin OpenAI configurado)
```

### **2. En el frontend**

Después de subir un PDF, verás:
- Badge azul: **"🤖 Detectadas con IA"**
- En info del PDF: **"Método de análisis: 🤖 Inteligencia Artificial (GPT-4)"**

---

## 🔒 Seguridad de la API Key

### **✅ HACER:**
- Guardar la key en `.env` (nunca en el código)
- Agregar `.env` al `.gitignore` (ya está)
- Usar variables de entorno en producción
- Regenerar la key si se expone accidentalmente

### **❌ NO HACER:**
- Commitear la key al repositorio
- Compartir la key públicamente
- Usar la misma key en múltiples proyectos de producción

---

## 🎯 Uso del Sistema

### **Con OpenAI configurado:**

```
1. Usuario sube PDF → 
2. Backend extrae texto →
3. 🤖 OpenAI analiza el texto →
4. Detecta transacciones inteligentemente →
5. Frontend muestra resultados con badge "Detectadas con IA"
```

### **Sin OpenAI (Fallback):**

```
1. Usuario sube PDF → 
2. Backend extrae texto →
3. 📝 Regex busca patrones específicos →
4. Detecta solo formatos programados →
5. Frontend muestra resultados normales
```

---

## 🐛 Troubleshooting

### **Error: "OpenAI API key no configurada"**
```bash
# Verifica que el .env tenga la key
cat backend/.env | grep OPENAI

# Debe mostrar:
OPENAI_API_KEY=sk-proj-xxxxx

# Reinicia el backend
pkill -f "node.*backend"
cd backend && npm run dev
```

### **Error: "Incorrect API key provided"**
- La key está mal copiada o expiró
- Verifica en: https://platform.openai.com/api-keys
- Crea una nueva key si es necesario

### **Error: "Rate limit exceeded"**
- Has usado todos los créditos o alcanzaste el límite
- Verifica uso en: https://platform.openai.com/usage
- Agrega créditos o espera el reset mensual

### **No detecta transacciones con IA**
- El PDF puede ser una imagen escaneada (no texto seleccionable)
- Intenta con un PDF generado digitalmente
- El formato puede ser muy complejo, la IA hará su mejor esfuerzo

---

## 📊 Monitoreo de Uso

### **Dashboard de OpenAI:**
https://platform.openai.com/usage

Aquí puedes ver:
- 💰 Créditos restantes
- 📈 Uso diario/mensual
- 📊 Costos por request
- 🚨 Alertas de límites

### **Logs en el backend:**

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# O si está corriendo localmente
# Los logs se muestran en la terminal donde corriste npm run dev
```

---

## 🎉 Alternativas sin Costo

Si no quieres usar OpenAI, el sistema **funciona perfectamente con regex**:

- ✅ Sin costo adicional
- ✅ Sin necesidad de internet
- ✅ Privacidad total (no envía datos externos)
- ⚠️ Solo detecta formatos específicos programados

El regex mejorado incluye soporte para:
- Fechas: DD/MM/YYYY, MM-DD-YYYY, YYYY/MM/DD
- Montos: Con o sin $, separadores de miles
- Múltiples formatos de columnas

---

## 📚 Recursos Adicionales

- **Documentación OpenAI:** https://platform.openai.com/docs
- **Precios actualizados:** https://openai.com/pricing
- **API Reference:** https://platform.openai.com/docs/api-reference
- **Community:** https://community.openai.com

---

## ✅ Checklist de Configuración

- [ ] Crear cuenta en OpenAI
- [ ] Agregar método de pago (opcional: usar $5 gratis)
- [ ] Crear API Key
- [ ] Copiar key a `backend/.env`
- [ ] Reiniciar backend
- [ ] Subir PDF de prueba
- [ ] Verificar en logs que usa IA
- [ ] Ver badge "🤖 Detectadas con IA" en frontend

---

**¡Listo! Ahora tu sistema puede analizar PDFs de cualquier banco del mundo con IA! 🚀**
