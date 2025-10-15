import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, CalendarClock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0, transactions: 0 });
  const [transactions, setTransactions] = useState([]);
  const [expectedExpenses, setExpectedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1'); // Meses: 1, 2, 3, 4, 6, 12

  // Formatear fecha usando zona horaria configurada o del navegador
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      const timezone = user?.timezone === 'auto' || !user?.timezone
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : user.timezone;
      
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        timeZone: timezone
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Formatear número con separadores de miles
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calcular mes de inicio
    const monthsToSubtract = parseInt(period) - 1; // -1 porque incluimos el mes actual
    const startMonth = currentMonth - monthsToSubtract;
    
    // Fecha de inicio: Día 1 del mes calculado
    const startDate = new Date(currentYear, startMonth, 1);
    
    // Fecha de fin: Último día del mes actual
    const endDate = new Date(currentYear, currentMonth + 1, 0); // Día 0 del próximo mes = último día del mes actual
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      const [statsRes, transRes, expensesRes] = await Promise.all([
        axios.get(`/api/transactions/stats?startDate=${startDate}&endDate=${endDate}`),
        axios.get(`/api/transactions?limit=5&startDate=${startDate}&endDate=${endDate}`),
        axios.get('/api/expected-expenses?status=pending').catch(() => ({ data: { data: [] } }))
      ]);

      setStats(statsRes.data.data);
      setTransactions(transRes.data.data.slice(0, 5));
      setExpectedExpenses(expensesRes.data.data.slice(0, 5));
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const pieData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        data: [parseFloat(stats.income || 0), parseFloat(stats.expense || 0)],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Balance Total"
          value={`${stats.currency || 'USD'} $${parseFloat(stats.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign />}
          color="blue"
          subtitle={stats.currency ? `Convertido a ${stats.currency}` : ''}
        />
        <StatCard
          title="Ingresos"
          value={`${stats.currency || 'USD'} $${parseFloat(stats.income || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp />}
          color="green"
        />
        <StatCard
          title="Gastos"
          value={`${stats.currency || 'USD'} $${parseFloat(stats.expense || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingDown />}
          color="red"
        />
        <StatCard
          title="Transacciones"
          value={stats.transactions || 0}
          icon={<CreditCard />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Distribución</h2>
          <div className="flex justify-center">
            <div style={{ width: '300px', height: '300px' }}>
              <Pie data={pieData} />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Transacciones Recientes</h2>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((trans) => (
                <div key={trans.id || trans._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{trans.description || 'Sin descripción'}</p>
                    <p className="text-sm text-gray-500">
                      {trans.category?.name} • {formatDate(trans.date)}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      trans.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trans.type === 'income' ? '+' : '-'}{trans.currency || 'USD'} ${formatAmount(trans.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay transacciones</p>
            )}
          </div>
        </div>
      </div>

      {/* Expected Expenses Section */}
      {expectedExpenses.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarClock className="text-orange-500" />
              Gastos Esperados Pendientes
            </h2>
            <Link 
              to="/expected-expenses" 
              className="text-primary hover:underline text-sm font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {expectedExpenses.map((expense) => {
              const isOverdue = new Date(expense.expectedDate) < new Date();
              return (
                <div 
                  key={expense.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isOverdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{expense.name}</p>
                      {isOverdue && (
                        <AlertCircle className="text-red-500" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {expense.category?.name} • {formatDate(expense.expectedDate)}
                      {isOverdue && <span className="text-red-600 font-medium ml-2">(Vencido)</span>}
                    </p>
                  </div>
                  <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {expense.currency} ${formatAmount(expense.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colors[color]} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1 italic">{subtitle}</p>
      )}
    </div>
  );
};

export default Dashboard;
