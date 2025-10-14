import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0, transactions: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, transRes] = await Promise.all([
        axios.get('/api/transactions/stats'),
        axios.get('/api/transactions?limit=5')
      ]);

      setStats(statsRes.data.data);
      setTransactions(transRes.data.data.slice(0, 5));
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
        data: [stats.income, stats.expense],
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Balance Total"
          value={`$${stats.balance.toFixed(2)}`}
          icon={<DollarSign />}
          color="blue"
        />
        <StatCard
          title="Ingresos"
          value={`$${stats.income.toFixed(2)}`}
          icon={<TrendingUp />}
          color="green"
        />
        <StatCard
          title="Gastos"
          value={`$${stats.expense.toFixed(2)}`}
          icon={<TrendingDown />}
          color="red"
        />
        <StatCard
          title="Transacciones"
          value={stats.transactions}
          icon={<CreditCard />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div key={trans._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{trans.description || 'Sin descripción'}</p>
                    <p className="text-sm text-gray-500">
                      {trans.category?.name} • {new Date(trans.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${
                      trans.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trans.type === 'income' ? '+' : '-'}${trans.amount.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay transacciones</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
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
    </div>
  );
};

export default Dashboard;
