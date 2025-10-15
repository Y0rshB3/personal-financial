import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [period, setPeriod] = useState('1'); // Filtro de período
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    currency: 'USD',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [displayAmount, setDisplayAmount] = useState(''); // Para mostrar el monto formateado

  // Formatear número con separadores de miles
  const formatNumber = (value) => {
    if (!value) return '';
    // Remover todo excepto números y punto decimal
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1].slice(0, 2)}` : integerPart;
  };

  // Manejar cambio en el campo de monto
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Remover todo excepto números y punto
    const cleanValue = value.replace(/[^\d.]/g, '');
    // Limitar a 2 decimales
    const parts = cleanValue.split('.');
    const finalValue = parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : cleanValue;
    
    setFormData({ ...formData, amount: finalValue });
    setDisplayAmount(formatNumber(finalValue));
  };

  // Formatear fecha usando zona horaria local del navegador
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    try {
      // Crear fecha desde el string UTC y convertir a zona horaria local
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      // Formatear en zona horaria local del navegador
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'MXN', 'ARS', 'COP', 'CLP'];

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [period]);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(period));
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const fetchTransactions = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const res = await axios.get(`/api/transactions?startDate=${startDate}&endDate=${endDate}`);
      setTransactions(res.data.data);
    } catch (error) {
      toast.error('Error al cargar transacciones');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convertir fecha local a ISO string manteniendo la fecha seleccionada
      const localDate = new Date(formData.date + 'T12:00:00'); // Usar mediodía para evitar cambios de día
      
      // Preparar datos para enviar al backend
      const dataToSend = {
        type: formData.type,
        amount: formData.amount,
        currency: formData.currency,
        categoryId: formData.category, // Cambiar 'category' a 'categoryId'
        description: formData.description,
        date: localDate.toISOString() // Enviar como ISO string con zona horaria
      };

      if (editingId) {
        await axios.put(`/api/transactions/${editingId}`, dataToSend);
        toast.success('Transacción actualizada');
      } else {
        await axios.post('/api/transactions', dataToSend);
        toast.success('Transacción creada');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ type: 'expense', amount: '', currency: 'USD', category: '', description: '', date: new Date().toISOString().split('T')[0] });
      setDisplayAmount('');
      fetchTransactions();
    } catch (error) {
      toast.error('Error al guardar transacción');
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id || transaction._id);
    const amount = transaction.amount.toString();
    setFormData({
      type: transaction.type,
      amount: amount,
      currency: transaction.currency || 'USD',
      category: transaction.category?.id || transaction.category?._id || transaction.categoryId,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
    setDisplayAmount(formatNumber(amount));
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta transacción?')) return;

    try {
      await axios.delete(`/api/transactions/${id}`);
      toast.success('Transacción eliminada');
      fetchTransactions();
    } catch (error) {
      toast.error('Error al eliminar transacción');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Transacciones</h1>
        
        <div className="flex items-center gap-4">
          {/* Filtro de Período */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary"
            >
              <option value="1">Mes actual</option>
              <option value="2">Últimos 2 meses</option>
              <option value="3">Últimos 3 meses</option>
              <option value="4">Últimos 4 meses</option>
              <option value="6">Últimos 6 meses</option>
              <option value="12">Último año</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            Nueva Transacción
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((trans) => (
              <tr key={trans.id || trans._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(trans.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    trans.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trans.type === 'income' ? 'Ingreso' : 'Gasto'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="flex items-center gap-2">
                    {trans.category?.icon} {trans.category?.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{trans.description}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                  trans.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="flex items-center gap-1">
                    {trans.type === 'income' ? '+' : '-'}
                    <span className="text-xs font-medium text-gray-600">{trans.currency || 'USD'}</span>
                    ${parseFloat(trans.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(trans)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(trans.id || trans._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay transacciones registradas
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monto</label>
                <input
                  type="text"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Moneda</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.filter(c => c.type === formData.type).map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {categories.filter(c => c.type === formData.type).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No hay categorías de tipo {formData.type === 'income' ? 'ingreso' : 'gasto'}. 
                    Crea una en la sección Categorías.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({ type: 'expense', amount: '', currency: 'USD', category: '', description: '', date: new Date().toISOString().split('T')[0] });
                    setDisplayAmount('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
