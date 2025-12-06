export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  name: string;
  email: string;
  documentId: string; // DNI, CIF, etc.
  role: UserRole;
  password?: string; // Only used internally in mock backend
}

export interface Invoice {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'Pagado' | 'Pendiente' | 'Vencido';
  userId?: string; // Assigned specifically to a user ID
  documentId?: string; // Assigned to a document ID (alternative matching)
  fileName: string;
  fileUrl: string; // Mock URL
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}