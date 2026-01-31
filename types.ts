export type UserRole = 'admin' | 'client' | null;

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  categoryId: string;
  createdAt: number;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}
