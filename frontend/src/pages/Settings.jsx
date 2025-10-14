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
  const [pdfData, setPdfData] = useState(null);
  const [extractedTransactions, setExtractedTransactions] = useState([]);
  const [analysisMethod, setAnalysisMethod] = useState(null);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'MXN', 'ARS', 'COP', 'CLP'];

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

    try {
      // Upload y extraer texto
      const uploadRes = await axios.post('/api/pdfs/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPdfData(uploadRes.data.data);
      toast.success(`PDF cargado: ${uploadRes.data.data.pages} páginas procesadas`);

      // Procesar y extraer transacciones
      const processRes = await axios.post('/api/pdfs/process', {
        text: uploadRes.data.data.text,
        fileId: uploadRes.data.data.id
      });

      setAnalysisMethod(processRes.data.data.method);
      
      if (processRes.data.data.transactions.length > 0) {
        setExtractedTransactions(processRes.data.data.transactions);
        const methodText = processRes.data.data.method === 'ai' ? '🤖 IA' : '📝 Regex';
        toast.success(`${methodText}: ${processRes.data.data.found} transacciones detectadas`);
      } else {
        toast.info('No se detectaron transacciones automáticamente. Revisa el formato del PDF.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleImportTransaction = async (transaction) => {
    try {
      await axios.post('/api/transactions', {
        type: 'expense', // Por defecto gastos, el usuario puede cambiar después
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        currency: formData.currency,
        source: 'pdf'
      });

      toast.success('Transacción importada exitosamente');
      // Remover de la lista
      setExtractedTransactions(prev => prev.filter(t => t !== transaction));
    } catch (error) {
      toast.error('Error al importar transacción');
    }
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

          {/* Transacciones Detectadas */}
          {extractedTransactions.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  Transacciones Detectadas ({extractedTransactions.length})
                </h3>
                {analysisMethod === 'ai' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    🤖 Detectadas con IA
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {extractedTransactions.map((trans, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{trans.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>💰 ${parseFloat(trans.amount || 0).toFixed(2)}</span>
                        <span>📅 {new Date(trans.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImportTransaction(trans)}
                      className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Importar
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Nota:</strong> Revisa cada transacción antes de importar. Las transacciones se importarán como "gastos" por defecto. Puedes editarlas después desde la sección de Transacciones.
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
