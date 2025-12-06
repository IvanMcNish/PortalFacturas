import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Invoice } from '../types';
import { getInvoicesForUser } from '../services/storageService';
import { Download, FileText, Search, RefreshCw, Calendar, CreditCard } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await getInvoicesForUser(user);
        // Sort by date desc
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setInvoices(data);
      } catch (error) {
        console.error("Error loading invoices", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredInvoices = invoices.filter(inv => 
    inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'paid': return 'bg-green-100 text-green-800 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
     switch(status) {
        case 'paid': return 'Pagada';
        case 'pending': return 'Pendiente';
        case 'overdue': return 'Vencida';
        default: return status;
    }
  }

  const handleDownload = (invoice: Invoice) => {
    alert(`Simulando descarga de: ${invoice.fileName}\n(En una app real, esto abriría el PDF)`);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Facturas</h1>
          <p className="text-gray-500">Consulta y descarga tus documentos fiscales</p>
        </div>
        <button 
          onClick={loadData}
          className="p-2 text-gray-600 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
          title="Actualizar"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
            placeholder="Buscar por concepto o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
            <CreditCard className="w-4 h-4" />
            <span>Doc ID: <span className="font-mono text-gray-700 font-medium">{user?.documentId}</span></span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando facturas...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tienes facturas</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">No se encontraron facturas asociadas a tu usuario o documento de identificación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden group">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(inv.status)}`}>
                    {getStatusText(inv.status)}
                  </div>
                  <span className="text-xs text-gray-400 font-mono">#{inv.id.slice(-6)}</span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate" title={inv.title}>{inv.title}</h3>
                <p className="text-2xl font-bold text-primary mb-4">{formatCurrency(inv.amount)}</p>
                
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(inv.date).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => handleDownload(inv)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-gray-200 group-hover:border-primary group-hover:text-primary"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default UserDashboard;