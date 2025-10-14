import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Globe, Upload } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'USD'
  });
  const [loading, setLoading] = useState(false);

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

    const formData = new FormData();
    formData.append('pdf', file);

    setLoading(true);

    try {
      const res = await axios.post('/api/pdfs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('PDF procesado exitosamente');
      console.log('PDF Data:', res.data);
    } catch (error) {
      toast.error('Error al procesar PDF');
    } finally {
      setLoading(false);
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
            className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
          />
          <p className="text-xs text-gray-500 mt-2">
            Formatos soportados: PDF (máximo 5MB)
          </p>
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
