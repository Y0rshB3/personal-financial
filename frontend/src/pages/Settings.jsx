import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Globe, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'USD'
  });
  const [loading, setLoading] = useState(false);
  const [processingPdf, setProcessingPdf] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [extractedTransactions, setExtractedTransactions] = useState([]);
  const [analysisMethod, setAnalysisMethod] = useState(null);
  const [pdfCurrency, setPdfCurrency] = useState('USD');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'MXN', 'ARS', 'COP', 'CLP'];

  // Cargar categorías al montar el componente
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data.data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/auth/profile', formData);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5242880) {
      toast.error('El archivo es muy grande. Máximo 5MB');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('pdf', file);

    setLoading(true);
    setPdfData(null);
    setExtractedTransactions([]);
    setProcessingPdf(false);

    try {
      // Upload y extraer texto
      toast.loading('Subiendo PDF...');
      const uploadRes = await axios.post('/api/pdfs/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPdfData(uploadRes.data.data);
      toast.dismiss();
      toast.success(`PDF cargado: ${uploadRes.data.data.pages} páginas procesadas`);

      // Procesar y extraer transacciones con IA
      setProcessingPdf(true);
      const loadingToast = toast.loading('🤖 Analizando transacciones con IA...');
      
      const processRes = await axios.post('/api/pdfs/process', {
        text: uploadRes.data.data.text,
        fileId: uploadRes.data.data.id,
        currency: formData.currency
      });

      toast.dismiss(loadingToast);
      setAnalysisMethod(processRes.data.data.method);
      
      if (processRes.data.data.transactions.length > 0) {
        // Asignar moneda global a todas las transacciones
        const transactionsWithCurrency = processRes.data.data.transactions.map(t => ({
          ...t,
          currency: pdfCurrency
        }));
        setExtractedTransactions(transactionsWithCurrency);
        setSelectedTransactions([]);
        const methodText = processRes.data.data.method === 'ai' ? '🤖 IA' : '📝 Regex';
        toast.success(`${methodText}: ${processRes.data.data.found} transacciones detectadas`);
      } else {
        toast.info('No se detectaron transacciones automáticamente. Revisa el formato del PDF.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Error al procesar PDF');
    } finally {
      setLoading(false);
      setProcessingPdf(false);
    }
  };

  const handleToggleTransaction = (index) => {
    setSelectedTransactions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleToggleAll = () => {
    if (selectedTransactions.length === extractedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(extractedTransactions.map((_, i) => i));
    }
  };

  const handleUpdateTransactionCategory = (index, categoryId) => {
    setExtractedTransactions(prev => prev.map((t, i) => 
      i === index ? { ...t, categoryId } : t
    ));
  };

  const handleImportTransaction = async (transaction) => {
    try {
      await axios.post('/api/transactions', {
        type: transaction.type || 'expense',
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        currency: transaction.currency || pdfCurrency,
        categoryId: transaction.categoryId,
        source: 'pdf'
      });

      toast.success('Transacción importada exitosamente');
      // Remover de la lista
      setExtractedTransactions(prev => prev.filter(t => t !== transaction));
      setSelectedTransactions([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al importar transacción');
    }
  };

  const handleImportSelected = async () => {
    if (selectedTransactions.length === 0) {
      toast.error('Selecciona al menos una transacción');
      return;
    }

    const toastId = toast.loading(`Importando ${selectedTransactions.length} transacciones...`);
    let imported = 0;
    let failed = 0;

    for (const index of selectedTransactions) {
      const transaction = extractedTransactions[index];
      try {
        await axios.post('/api/transactions', {
          type: transaction.type || 'expense',
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
          currency: transaction.currency || pdfCurrency,
          categoryId: transaction.categoryId,
          source: 'pdf'
        });
        imported++;
      } catch (error) {
        failed++;
      }
    }

    toast.dismiss(toastId);
    
    if (failed === 0) {
      toast.success(`✅ ${imported} transacciones importadas exitosamente`);
    } else {
      toast.warning(`⚠️ ${imported} importadas, ${failed} fallidas`);
    }

    // Remover las importadas
    setExtractedTransactions(prev => 
      prev.filter((_, i) => !selectedTransactions.includes(i))
    );
    setSelectedTransactions([]);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Configuración</h1>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Perfil de Usuario</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Moneda Preferida</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Currency Converter */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-green-600" size={24} />
            <h2 className="text-xl font-bold">Conversor de Monedas</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Utiliza el API de conversión integrado en las transacciones para convertir entre diferentes monedas automáticamente.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Conversión automática habilitada para {formData.currency}
            </p>
          </div>
        </div>

        {/* PDF Upload */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold">Importar desde PDF</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Sube un PDF de tu estado de cuenta bancario para extraer transacciones automáticamente.
          </p>

          {/* Selector de Moneda Global */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Moneda del PDF</label>
            <select
              value={pdfCurrency}
              onChange={(e) => setPdfCurrency(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Todas las transacciones del PDF se importarán con esta moneda
            </p>
          </div>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={loading}
            className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-2">
            Formatos soportados: PDF (máximo 5MB)
          </p>

          {/* PDF Info */}
          {pdfData && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="text-purple-600 flex-shrink-0 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-900 mb-2">PDF Procesado</h3>
                  <div className="text-sm text-purple-800 space-y-1">
                    <p><strong>Páginas:</strong> {pdfData.pages}</p>
                    <p><strong>Caracteres extraídos:</strong> {pdfData.text?.length || 0}</p>
                    {analysisMethod && (
                      <p><strong>Método de análisis:</strong> {analysisMethod === 'ai' ? '🤖 Inteligencia Artificial (GPT-4)' : '📝 Expresiones regulares'}</p>
                    )}
                  </div>
                  
                  {/* Mostrar preview del texto */}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-purple-600 text-sm font-medium hover:text-purple-800">
                      Ver texto extraído
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded border border-purple-200 max-h-40 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap text-gray-700">
                        {pdfData.text?.substring(0, 500)}...
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}

          {/* Loading Análisis IA */}
          {processingPdf && (
            <div className="mt-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div>
                  <h3 className="font-semibold text-blue-900">Analizando con Inteligencia Artificial...</h3>
                  <p className="text-sm text-blue-700 mt-1">Esto puede tomar 10-30 segundos. La IA está leyendo y comprendiendo el documento.</p>
                </div>
              </div>
            </div>
          )}

          {/* Transacciones Detectadas */}
          {extractedTransactions.length > 0 && !processingPdf && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === extractedTransactions.length}
                    onChange={handleToggleAll}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    Transacciones ({selectedTransactions.length}/{extractedTransactions.length})
                  </h3>
                  {analysisMethod === 'ai' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      🤖 Detectadas con IA
                    </span>
                  )}
                </div>
                {selectedTransactions.length > 0 && (
                  <button
                    onClick={handleImportSelected}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Importar {selectedTransactions.length}
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {extractedTransactions.map((trans, index) => {
                  const transCategory = categories.find(c => c.id === trans.categoryId);
                  const availableCategories = categories.filter(c => c.type === trans.type);
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(index)}
                        onChange={() => handleToggleTransaction(index)}
                        className="w-5 h-5 text-purple-600 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-gray-900">{trans.description}</p>
                          {trans.type === 'income' && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Ingreso</span>
                          )}
                          {trans.type === 'expense' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Gasto</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            💰 <strong>{pdfCurrency}</strong> ${parseFloat(trans.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span>📅 {new Date(trans.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-700">Categoría:</label>
                          <select
                            value={trans.categoryId || ''}
                            onChange={(e) => handleUpdateTransactionCategory(index, e.target.value)}
                            className="text-sm px-3 py-1 border rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Seleccionar...</option>
                            {availableCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </option>
                            ))}
                          </select>
                          {trans.suggestedCategory && !trans.categoryId && (
                            <span className="text-xs text-purple-600 italic">
                              (Sugerida: {trans.suggestedCategory})
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleImportTransaction(trans)}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                      >
                        <CheckCircle size={14} />
                        Importar
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Tip:</strong> Selecciona múltiples transacciones y usa "Importar {selectedTransactions.length}" para importar todas a la vez. Puedes cambiar la categoría de cada una antes de importar.
                </p>
              </div>
            </div>
          )}

          {/* No transacciones detectadas */}
          {pdfData && extractedTransactions.length === 0 && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <XCircle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">No se detectaron transacciones</h3>
                  <p className="text-sm text-orange-800">
                    El PDF no contiene un formato reconocible de transacciones. Puedes:
                  </p>
                  <ul className="text-sm text-orange-800 mt-2 ml-4 list-disc space-y-1">
                    <li>Agregar transacciones manualmente desde la sección "Transacciones"</li>
                    <li>Verificar que el PDF sea un estado de cuenta bancario válido</li>
                    <li>Intentar con un PDF de otro formato</li>
                  </ul>
                  <p className="text-xs text-orange-700 mt-3">
                    <strong>Formato esperado:</strong> Fecha Monto Descripción (ej: 14/10/2025 $120.50 Supermercado)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="font-bold mb-2">Información de Cuenta</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Rol:</strong> {user?.role}</p>
            <p><strong>Miembro desde:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
