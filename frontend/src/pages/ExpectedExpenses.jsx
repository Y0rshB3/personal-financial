import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, CheckCircle, Clock } from 'lucide-react';

const ExpectedExpenses = () => {
  const [expectedExpenses, setExpectedExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  const [stats, setStats] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    categoryId: '',
    description: '',
    expectedDate: new Date().toISOString().split('T')[0],
    recurrence: 'none',
    tags: []
  });
  const [displayAmount, setDisplayAmount] = useState('');

  // Formatear número con separadores de miles
  const formatNumber = (value) => {
    if (!value) return '';
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1].slice(0, 2)}` : integerPart;
  };

  // Manejar cambio en el campo de monto
  const handleAmountChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const finalValue = parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : cleanValue;
    
    setFormData({ ...formData, amount: finalValue });
    setDisplayAmount(formatNumber(finalValue));
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'MXN', 'ARS', 'COP', 'CLP'];
  const recurrenceOptions = [
    { value: 'none', label: 'Sin recurrencia' },
    { value: 'daily', label: 'Diaria' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' }
  ];

  useEffect(() => {
    fetchExpectedExpenses();
    fetchCategories();
    fetchStats();
  }, [filterStatus]);

  const fetchExpectedExpenses = async () => {
    try {
      const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await axios.get(`/api/expected-expenses${statusParam}`);
      setExpectedExpenses(res.data.data);
    } catch (error) {
      toast.error('Error al cargar gastos esperados');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      // Filtrar solo categorías de tipo expense
      setCategories(res.data.data.filter(c => c.type === 'expense'));
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/expected-expenses/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convertir fecha local a ISO string manteniendo la fecha seleccionada
      const localDate = new Date(formData.expectedDate + 'T12:00:00');
      
      const dataToSend = {
        ...formData,
        expectedDate: localDate.toISOString()
      };

      if (editingId) {
        await axios.put(`/api/expected-expenses/${editingId}`, dataToSend);
        toast.success('Gasto esperado actualizado');
      } else {
        await axios.post('/api/expected-expenses', dataToSend);
        toast.success('Gasto esperado creado');
      }

      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchExpectedExpenses();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar gasto esperado');
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    const amount = expense.amount.toString();
    setFormData({
      name: expense.name,
      amount: amount,
      currency: expense.currency || 'USD',
      categoryId: expense.category?.id || expense.categoryId,
      description: expense.description || '',
      expectedDate: new Date(expense.expectedDate).toISOString().split('T')[0],
      recurrence: expense.recurrence || 'none',
      tags: expense.tags || []
    });
    setDisplayAmount(formatNumber(amount));
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este gasto esperado?')) return;

    try {
      await axios.delete(`/api/expected-expenses/${id}`);
      toast.success('Gasto esperado eliminado');
      fetchExpectedExpenses();
      fetchStats();
    } catch (error) {
      toast.error('Error al eliminar gasto esperado');
    }
  };

  const handleComplete = async (expense) => {
    if (!window.confirm(`¿Marcar "${expense.name}" como realizado? Esto creará una transacción de gasto.`)) return;

    try {
      await axios.post(`/api/expected-expenses/${expense.id}/complete`, {
        amount: expense.amount,
        currency: expense.currency,
        description: expense.description,
        date: new Date()
      });
      toast.success('Gasto marcado como realizado y transacción creada');
      fetchExpectedExpenses();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al completar gasto esperado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      currency: 'USD',
      categoryId: '',
      description: '',
      expectedDate: new Date().toISOString().split('T')[0],
      recurrence: 'none',
      tags: []
    });
    setDisplayAmount('');
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completado</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
  };

  const isOverdue = (expectedDate) => {
    return new Date(expectedDate) < new Date() && new Date(expectedDate).toDateString() !== new Date().toDateString();
  };

  // Formatear fecha usando zona horaria local del navegador
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
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

  // Formatear monto para mostrar
  const formatAmountDisplay = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gastos Esperados</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filtro:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completados</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            Nuevo Gasto Esperado
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Gastos</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Completados</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Monto Pendiente</p>
            <p className="text-2xl font-bold text-red-600">
              ${stats.pendingAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Esperada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurrencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expectedExpenses.map((expense) => (
              <tr 
                key={expense.id} 
                className={`hover:bg-gray-50 ${isOverdue(expense.expectedDate) && expense.status === 'pending' ? 'bg-red-50' : ''}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {expense.name}
                  {expense.description && (
                    <p className="text-xs text-gray-500 mt-1">{expense.description}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="flex items-center gap-2">
                    {expense.category?.icon} {expense.category?.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {isOverdue(expense.expectedDate) && expense.status === 'pending' && (
                      <Clock size={16} className="text-red-500" />
                    )}
                    <span className={isOverdue(expense.expectedDate) && expense.status === 'pending' ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                      {formatDate(expense.expectedDate)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  <span className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">{expense.currency || 'USD'}</span>
                    ${formatAmountDisplay(expense.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(expense.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recurrenceOptions.find(r => r.value === expense.recurrence)?.label || 'Sin recurrencia'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {expense.status === 'pending' && (
                      <button
                        onClick={() => handleComplete(expense)}
                        className="text-green-600 hover:text-green-800"
                        title="Marcar como realizado"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {expense.status === 'pending' && (
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expectedExpenses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay gastos esperados registrados
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Editar Gasto Esperado' : 'Nuevo Gasto Esperado'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Pago de renta, Recibo de luz..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monto *</label>
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
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha Esperada *</label>
                <input
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Recurrencia</label>
                <select
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {recurrenceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
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
                    resetForm();
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

export default ExpectedExpenses;
