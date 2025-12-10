import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Invoice } from '../types';
import { getUsers, getInvoices, createInvoice } from '../services/storageService';
import { UploadCloud, Users, FilePlus, CheckCircle, Search, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pendiente' as const,
    assignType: 'user' as 'user' | 'document',
    selectedUserId: '',
    targetDocumentId: '',
    fileName: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(getUsers().filter(u => u.role !== 'admin')); // Only show regular users
    setInvoices(getInvoices());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, fileName: e.target.files![0].name }));
    }
  };

  const formatCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      if (!form.fileName) throw new Error('Debes seleccionar un archivo (PDF simulado)');
      if (form.assignType === 'user' && !form.selectedUserId) throw new Error('Selecciona un usuario');
      if (form.assignType === 'document' && !form.targetDocumentId) throw new Error('Ingresa un documento ID');

      await createInvoice({
        title: form.title,
        amount: parseFloat(form.amount),
        date: form.date,
        status: form.status,
        fileName: form.fileName,
        userId: form.assignType === 'user' ? form.selectedUserId : undefined,
        documentId: form.assignType === 'document' ? form.targetDocumentId : undefined
      });

      setNotification({ msg: 'Factura creada exitosamente', type: 'success' });
      // Reset form partially
      setForm(prev => ({ ...prev, title: '', amount: '', fileName: '' }));
      refreshData();
    } catch (error: any) {
      setNotification({ msg: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
        <p className="text-gray-500">Gestiona usuarios y sube facturas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-primary" />
              Nueva Factura
            </h2>

            {notification && (
              <div className={`p-3 rounded-lg mb-4 text-sm flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {notification.type === 'success' ? <CheckCircle className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
                {notification.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concepto / Título</label>
                <input
                  type="text"
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Ej. Servicio Consultoría"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor ($ COP)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                      value={form.amount}
                      onChange={e => setForm({...form, amount: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border"
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value as any})}
                >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagada</option>
                    <option value="Vencido">Vencido</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Asignar a:</label>
                <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900 font-bold hover:text-primary">
                        <input 
                            type="radio" 
                            name="assignType" 
                            checked={form.assignType === 'user'}
                            onChange={() => setForm({...form, assignType: 'user'})}
                            className="text-primary focus:ring-primary"
                        />
                        Usuario Registrado
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-900 font-bold hover:text-primary">
                        <input 
                            type="radio" 
                            name="assignType" 
                            checked={form.assignType === 'document'}
                            onChange={() => setForm({...form, assignType: 'document'})}
                            className="text-primary focus:ring-primary"
                        />
                        Documento ID
                    </label>
                </div>

                {form.assignType === 'user' ? (
                     <select 
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border text-sm"
                        value={form.selectedUserId}
                        onChange={(e) => setForm({...form, selectedUserId: e.target.value})}
                    >
                        <option value="">-- Seleccionar Usuario --</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.documentId})</option>
                        ))}
                    </select>
                ) : (
                    <input 
                        type="text"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2 border text-sm"
                        placeholder="Ej. 12345678X"
                        value={form.targetDocumentId}
                        onChange={(e) => setForm({...form, targetDocumentId: e.target.value})}
                    />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo de Factura</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg"
                    />
                    <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <span className="font-medium text-primary hover:text-blue-500">
                                {form.fileName || "Sube un archivo"}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-black text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Crear Asignación'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Lists */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Users className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Usuarios</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <FilePlus className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Facturas Totales</p>
                        <p className="text-2xl font-bold">{invoices.length}</p>
                    </div>
                </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Facturas Recientes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3 text-gray-900 font-bold">Concepto</th>
                                <th className="px-6 py-3">Asignado A</th>
                                <th className="px-6 py-3 text-gray-900 font-bold">Valor</th>
                                <th className="px-6 py-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.slice().reverse().slice(0, 5).map(inv => {
                                const assignedUser = users.find(u => u.id === inv.userId);
                                const assignLabel = assignedUser 
                                    ? assignedUser.name 
                                    : `Doc: ${inv.documentId || 'N/A'}`;

                                return (
                                    <tr key={inv.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-gray-500">{inv.id.slice(-6)}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{inv.title}</td>
                                        <td className="px-6 py-4 text-gray-600">{assignLabel}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{formatCOP(inv.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                inv.status === 'Pagado' ? 'bg-green-100 text-green-800' : 
                                                inv.status === 'Vencido' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay facturas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;