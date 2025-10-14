import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Download, Mail, Lightbulb } from 'lucide-react';

const Reports = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get('/api/reports/savings-recommendations');
      setRecommendations(res.data.data);
    } catch (error) {
      toast.error('Error al cargar recomendaciones');
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/export/excel', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transacciones.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/reports/email', { email });
      toast.success('Reporte enviado por email');
      setEmail('');
    } catch (error) {
      toast.error('Error al enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reportes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Export Excel */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Download className="text-green-600" size={24} />
            <h2 className="text-xl font-bold">Exportar a Excel</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Descarga todas tus transacciones en un archivo Excel para análisis detallado.
          </p>
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Exportando...' : 'Descargar Excel'}
          </button>
        </div>

        {/* Send Email */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Enviar por Email</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Recibe un reporte de tus finanzas en tu correo electrónico.
          </p>
          <form onSubmit={handleSendEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </form>
        </div>
      </div>

      {/* Savings Recommendations */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="text-yellow-600" size={24} />
          <h2 className="text-xl font-bold">Recomendaciones de Ahorro</h2>
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <h3 className="font-bold mb-2">{rec.category}</h3>
                <p className="text-gray-700">{rec.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">¡Excelente! No hay recomendaciones por ahora.</p>
            <p className="text-sm text-gray-400">
              Continúa registrando tus transacciones para obtener sugerencias personalizadas.
            </p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl shadow-md text-white">
        <h3 className="text-xl font-bold mb-2">💡 Consejos</h3>
        <ul className="space-y-2 text-sm">
          <li>• Revisa tus reportes mensualmente para identificar patrones de gasto</li>
          <li>• Establece presupuestos en cada categoría para mejor control</li>
          <li>• Exporta tus datos regularmente como respaldo</li>
          <li>• Utiliza las recomendaciones para optimizar tus finanzas</li>
        </ul>
      </div>
    </div>
  );
};

export default Reports;
