const axios = require('axios');

// Cache para tipos de cambio históricos (evita múltiples llamadas al API)
const exchangeRateCache = new Map();

/**
 * Obtiene el tipo de cambio histórico para una fecha específica
 * @param {string} from - Moneda origen (ej: 'USD')
 * @param {string} to - Moneda destino (ej: 'COP')
 * @param {Date} date - Fecha de la transacción
 * @returns {Promise<number>} - Tipo de cambio
 */
exports.getHistoricalExchangeRate = async (from, to, date) => {
  // Si son la misma moneda, el tipo de cambio es 1
  if (from === to) {
    return 1;
  }

  // Formato de fecha: YYYY-MM-DD
  const dateStr = date.toISOString().split('T')[0];
  const cacheKey = `${from}_${to}_${dateStr}`;

  // Verificar si ya está en caché
  if (exchangeRateCache.has(cacheKey)) {
    console.log(`💾 Cache hit: ${cacheKey} = ${exchangeRateCache.get(cacheKey)}`);
    return exchangeRateCache.get(cacheKey);
  }

  try {
    // Usando exchangerate-api.com (gratis, soporta históricos)
    // Formato: https://api.exchangerate-api.com/v4/history/{from}/{year}/{month}/{day}
    const [year, month, day] = dateStr.split('-');
    const url = `https://api.exchangerate-api.com/v4/history/${from}/${year}/${month}/${day}`;

    console.log(`🌐 Obteniendo tipo de cambio: ${from} → ${to} para ${dateStr}`);
    
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data && response.data.rates && response.data.rates[to]) {
      const rate = response.data.rates[to];
      
      // Guardar en caché
      exchangeRateCache.set(cacheKey, rate);
      
      console.log(`✅ Tipo de cambio obtenido: 1 ${from} = ${rate} ${to}`);
      return rate;
    }

    // Si no se encuentra el tipo de cambio histórico, usar el actual como fallback
    console.warn(`⚠️  No se encontró tipo histórico, usando actual`);
    return await exports.getCurrentExchangeRate(from, to);

  } catch (error) {
    console.error(`❌ Error obteniendo tipo de cambio histórico: ${error.message}`);
    
    // Fallback: intentar con tipo de cambio actual
    try {
      return await exports.getCurrentExchangeRate(from, to);
    } catch (fallbackError) {
      console.error(`❌ Error en fallback: ${fallbackError.message}`);
      // Si todo falla, retornar 1 (sin conversión)
      return 1;
    }
  }
};

/**
 * Obtiene el tipo de cambio actual (usado como fallback)
 * @param {string} from - Moneda origen
 * @param {string} to - Moneda destino
 * @returns {Promise<number>} - Tipo de cambio
 */
exports.getCurrentExchangeRate = async (from, to) => {
  if (from === to) {
    return 1;
  }

  const cacheKey = `${from}_${to}_current`;

  // Verificar caché (válido por 1 hora)
  if (exchangeRateCache.has(cacheKey)) {
    const cached = exchangeRateCache.get(cacheKey);
    const now = Date.now();
    if (cached.timestamp && (now - cached.timestamp < 3600000)) {
      return cached.rate;
    }
  }

  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
    const response = await axios.get(url, { timeout: 5000 });

    if (response.data && response.data.rates && response.data.rates[to]) {
      const rate = response.data.rates[to];
      
      // Guardar en caché con timestamp
      exchangeRateCache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      });

      return rate;
    }

    throw new Error(`No se encontró tasa para ${from} → ${to}`);
  } catch (error) {
    console.error(`Error obteniendo tipo de cambio actual: ${error.message}`);
    throw error;
  }
};

/**
 * Convierte un monto de una moneda a otra usando tipo histórico
 * @param {number} amount - Monto a convertir
 * @param {string} from - Moneda origen
 * @param {string} to - Moneda destino
 * @param {Date} date - Fecha de la transacción
 * @returns {Promise<number>} - Monto convertido
 */
exports.convertAmount = async (amount, from, to, date) => {
  if (from === to) {
    return amount;
  }

  const rate = await exports.getHistoricalExchangeRate(from, to, date);
  const convertedAmount = amount * rate;

  console.log(`💱 ${amount} ${from} (${date.toISOString().split('T')[0]}) = ${convertedAmount.toFixed(2)} ${to}`);

  return convertedAmount;
};

/**
 * Limpia el caché (útil para pruebas o mantenimiento)
 */
exports.clearCache = () => {
  exchangeRateCache.clear();
  console.log('🧹 Caché de tipos de cambio limpiado');
};
