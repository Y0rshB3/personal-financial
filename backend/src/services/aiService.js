const OpenAI = require('openai');

// Inicializar OpenAI (solo si hay API key)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Analiza texto de PDF bancario usando IA para extraer transacciones
 * Funciona con cualquier formato de estado de cuenta
 * @param {string} text - Texto extraído del PDF
 * @param {Array} userCategories - Categorías del usuario desde la BD
 */
exports.analyzeTransactionsWithAI = async (text, userCategories = []) => {
  if (!openai) {
    throw new Error('OpenAI API key no configurada. Agrega OPENAI_API_KEY en .env');
  }

  try {
    // Formatear categorías del usuario
    const expenseCategories = userCategories
      .filter(c => c.type === 'expense')
      .map(c => `"${c.name}" ${c.icon}`)
      .join(', ');
    
    const incomeCategories = userCategories
      .filter(c => c.type === 'income')
      .map(c => `"${c.name}" ${c.icon}`)
      .join(', ');
    
    // Crear mapa de categorías con IDs
    const categoryMap = {};
    userCategories.forEach(c => {
      categoryMap[c.name] = c.id;
    });

    const prompt = `Eres un experto en análisis de estados de cuenta bancarios. Analiza el siguiente texto extraído de un PDF bancario y extrae TODAS las transacciones que encuentres.

IMPORTANTE:
- Identifica cada transacción sin importar el formato del banco
- El texto puede estar MAL FORMATEADO (sin espacios, columnas pegadas)
- Busca patrones como: FECHA + DESCRIPCIÓN + MONTO
- Las fechas pueden estar en formato YYYY-MM-DD, DD/MM/YYYY, etc.
- Los montos pueden tener $, comas, puntos, negativos
- Extrae el MONTO como número positivo (ignora el signo negativo si es gasto)
- Si el monto es negativo ($-123.45), es un GASTO (expense)
- Si el monto es positivo ($123.45), es un INGRESO (income)
- Ignora encabezados, totales, balances finales, números de cuenta
- IMPORTANTE: Usa SOLO las categorías del usuario proporcionadas abajo

CATEGORÍAS DEL USUARIO (USA SOLO ESTAS):
GASTOS: ${expenseCategories || 'Ninguna definida'}
INGRESOS: ${incomeCategories || 'Ninguna definida'}

INSTRUCCIONES PARA CATEGORÍAS:
- Analiza la descripción de cada transacción
- Asigna la categoría MÁS APROPIADA de las disponibles
- Si no hay coincidencia clara, usa "Otros" si existe
- NO inventes categorías nuevas

EJEMPLOS:
"Compra en linea" → Si existe "Compras", úsala
"Supermercado" → Si existe "Alimentación", úsala
"Gasolina" → Si existe "Transporte", úsala
"Netflix" → Si existe "Entretenimiento", úsala

TEXTO DEL PDF:
${text.substring(0, 4000)}

Responde con un JSON que contenga un array "transactions":
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "amount": 123.45,
      "description": "Descripción",
      "type": "expense",
      "suggestedCategory": "Alimentación",
      "currency": "USD"
    }
  ]
}

Si no encuentras transacciones, responde: {"transactions": []}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Eres un asistente experto en análisis de documentos financieros. Siempre respondes con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    console.log('📄 Respuesta de OpenAI:', responseText.substring(0, 500));
    
    // Parsear la respuesta JSON
    let transactions = [];
    try {
      const parsed = JSON.parse(responseText);
      console.log('✅ JSON parseado correctamente');
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(parsed)) {
        transactions = parsed;
      } else if (parsed.transactions && Array.isArray(parsed.transactions)) {
        transactions = parsed.transactions;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        transactions = parsed.data;
      }
    } catch (e) {
      console.error('❌ Error parsing AI response:', e.message);
      // Intentar extraer JSON del texto
      const jsonMatch = responseText.match(/\{[\s\S]*"transactions"[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0] + '}');
          transactions = parsed.transactions || [];
        } catch (e2) {
          console.error('❌ Error en segundo intento:', e2.message);
        }
      }
    }

    // Validar y formatear transacciones
    const validTransactions = transactions
      .filter(t => t.date && t.amount && t.description)
      .map(t => {
        // Buscar el ID de la categoría sugerida
        const categoryId = categoryMap[t.suggestedCategory] || null;
        
        return {
          date: new Date(t.date),
          amount: parseFloat(t.amount),
          description: t.description.trim(),
          type: t.type || 'expense',
          currency: t.currency || 'USD',
          suggestedCategory: t.suggestedCategory || null,
          categoryId: categoryId,
          imported: false
        };
      });

    console.log(`✅ Transacciones válidas procesadas: ${validTransactions.length}`);
    if (validTransactions.length > 0) {
      console.log(`📊 Ejemplo: ${validTransactions[0].description} → ${validTransactions[0].suggestedCategory}`);
    }
    return validTransactions;
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    throw new Error('Error al analizar el PDF con IA: ' + error.message);
  }
};

/**
 * Fallback: Análisis con regex (método simple)
 */
exports.analyzeTransactionsWithRegex = (text) => {
  const lines = text.split('\n');
  const transactions = [];
  
  // Múltiples patrones para diferentes formatos
  const patterns = [
    // Formato: DD/MM/YYYY $123.45 Descripción
    /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+\$?(\d+[.,]\d{2})\s+(.+)/,
    // Formato: MM-DD-YYYY 123.45 Descripción
    /(\d{1,2}-\d{1,2}-\d{2,4})\s+(\d+[.,]\d{2})\s+(.+)/,
    // Formato: YYYY/MM/DD 123.45 Descripción
    /(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d+[.,]\d{2})\s+(.+)/,
    // Formato más flexible
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+.*?(\d+[.,]\d{2})\s+(.+)/
  ];
  
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          // Intentar parsear la fecha
          const dateStr = match[1];
          let date;
          
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts[0].length === 4) {
              // YYYY/MM/DD
              date = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
              // DD/MM/YYYY
              date = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          } else {
            // Formato con guiones
            const parts = dateStr.split('-');
            date = new Date(parts[2], parts[0] - 1, parts[1]);
          }
          
          const amount = parseFloat(match[2].replace(',', '.'));
          const description = match[3].trim();
          
          if (!isNaN(date.getTime()) && !isNaN(amount) && description.length > 0) {
            transactions.push({
              date,
              amount,
              description,
              type: 'expense',
              imported: false
            });
            break; // Ya encontramos match en esta línea
          }
        } catch (e) {
          continue;
        }
      }
    }
  }
  
  return transactions;
};
