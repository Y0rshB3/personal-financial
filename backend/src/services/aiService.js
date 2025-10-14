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
 */
exports.analyzeTransactionsWithAI = async (text) => {
  if (!openai) {
    throw new Error('OpenAI API key no configurada. Agrega OPENAI_API_KEY en .env');
  }

  try {
    const prompt = `Eres un experto en análisis de estados de cuenta bancarios. Analiza el siguiente texto extraído de un PDF bancario y extrae TODAS las transacciones que encuentres.

IMPORTANTE:
- Identifica cada transacción sin importar el formato del banco
- Extrae: fecha, monto (como número positivo) y descripción
- Las fechas pueden estar en cualquier formato (DD/MM/YYYY, MM-DD-YYYY, etc.)
- Los montos pueden tener o no símbolo de moneda ($, €, etc.)
- Ignora encabezados, totales, balances y texto no relacionado con transacciones
- Si hay múltiples columnas, identifica cuál es la columna de transacciones

TEXTO DEL PDF:
${text.substring(0, 4000)}

Responde ÚNICAMENTE con un JSON array válido en este formato:
[
  {
    "date": "YYYY-MM-DD",
    "amount": 123.45,
    "description": "Descripción de la transacción",
    "type": "expense" o "income"
  }
]

Si no encuentras transacciones, responde con un array vacío: []`;

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
    
    // Parsear la respuesta JSON
    let transactions = [];
    try {
      const parsed = JSON.parse(responseText);
      transactions = Array.isArray(parsed) ? parsed : parsed.transactions || [];
    } catch (e) {
      console.error('Error parsing AI response:', e);
      // Intentar extraer JSON del texto
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        transactions = JSON.parse(jsonMatch[0]);
      }
    }

    // Validar y formatear transacciones
    const validTransactions = transactions
      .filter(t => t.date && t.amount && t.description)
      .map(t => ({
        date: new Date(t.date),
        amount: parseFloat(t.amount),
        description: t.description.trim(),
        type: t.type || 'expense',
        imported: false
      }));

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
