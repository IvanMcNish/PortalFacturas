import { User, Invoice, UserRole } from '../types';

// Keys for LocalStorage
const USERS_KEY = 'portal_users';
const INVOICES_KEY = 'portal_invoices';

// Initial Mock Data
const SEED_USERS: User[] = [
  {
    id: 'u_admin',
    name: 'Administrador Principal',
    email: 'admin@portal.com',
    password: 'admin123', // In a real app, this would be hashed
    documentId: '00000000',
    role: UserRole.ADMIN
  },
  {
    id: 'u_demo',
    name: 'Erika Niño',
    email: 'user@portal.com',
    password: 'user123',
    documentId: '12345',
    role: UserRole.USER
  }
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    title: 'Factura Servicio Enero',
    amount: 150.00,
    date: '2023-10-15',
    status: 'Pagado',
    userId: 'u_demo',
    fileName: 'factura-enero.pdf',
    fileUrl: '#'
  },
  {
    id: 'inv_2',
    title: 'Transporte a Barrancabermeja',
    amount: 1250.50,
    date: '2023-10-20',
    status: 'Pendiente',
    documentId: '12345', // Linked by Document ID
    fileName: 'equipos.pdf',
    fileUrl: '#'
  }
];

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- USER METHODS ---

export const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(INVOICES_KEY)) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(SEED_INVOICES));
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  await delay(500);
  const users = getUsers();
  
  if (users.find(u => u.email === user.email)) {
    throw new Error('El correo ya está registrado');
  }

  const newUser: User = {
    ...user,
    id: `u_${Date.now()}`,
    role: UserRole.USER // Default role
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

// --- INVOICE METHODS ---

export const getInvoices = (): Invoice[] => {
  const invoices = localStorage.getItem(INVOICES_KEY);
  return invoices ? JSON.parse(invoices) : [];
};

export const getInvoicesForUser = async (user: User): Promise<Invoice[]> => {
  await delay(300);
  const allInvoices = getInvoices();
  // Match by User ID OR Document ID
  return allInvoices.filter(inv => 
    inv.userId === user.id || 
    (inv.documentId && inv.documentId === user.documentId)
  );
};

export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'fileUrl'>): Promise<Invoice> => {
  await delay(600);
  const invoices = getInvoices();
  
  const newInvoice: Invoice = {
    ...invoiceData,
    id: `inv_${Date.now()}`,
    fileUrl: '#' // In a real app, this comes from the cloud storage upload response
  };

  invoices.push(newInvoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  return newInvoice;
};

// Initialize on load
initializeStorage();