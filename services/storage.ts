import { Post, Category } from '../types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Prevenzione', color: 'bg-blue-100 text-blue-800' },
  { id: '2', name: 'Cosmetica', color: 'bg-pink-100 text-pink-800' },
  { id: '3', name: 'Integratori', color: 'bg-green-100 text-green-800' },
  { id: '4', name: 'Servizi', color: 'bg-purple-100 text-purple-800' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: '101',
    title: 'Offerta Solari 2024',
    content: '☀️ Proteggi la tua pelle quest\'estate! \n\nApprofitta della nostra promozione sui solari dermatologici. Acquistando due prodotti, il terzo è in omaggio! \n\n#Farmacia #Estate #ProtezioneSolare #Salute',
    imageUrl: 'https://picsum.photos/id/12/800/800',
    categoryId: '2',
    createdAt: Date.now() - 100000,
  },
  {
    id: '102',
    title: 'Misurazione Pressione Gratuita',
    content: '🩺 La prevenzione passa dal controllo costante.\n\nPassa in farmacia per misurare gratuitamente la tua pressione arteriosa. I nostri farmacisti sono a tua disposizione per un consulto.\n\n#Salute #Cuore #Prevenzione #FarmaciaDiFiducia',
    imageUrl: 'https://picsum.photos/id/24/800/800',
    categoryId: '4',
    createdAt: Date.now(),
  },
];

export const storageService = {
  getPosts: async (): Promise<Post[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      if (querySnapshot.empty) {
        // Initialize with default posts
        for (const post of INITIAL_POSTS) {
          await addDoc(collection(db, 'posts'), post);
        }
        return INITIAL_POSTS;
      }
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post));
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  },

  savePost: async (post: Post): Promise<Post[]> => {
    try {
      await addDoc(collection(db, 'posts'), post);
      return await storageService.getPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      return [];
    }
  },

  updatePost: async (updatedPost: Post): Promise<Post[]> => {
    try {
      const postRef = doc(db, 'posts', updatedPost.id);
      await updateDoc(postRef, { ...updatedPost });
      return await storageService.getPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      return [];
    }
  },

  deletePost: async (id: string): Promise<Post[]> => {
    try {
      await deleteDoc(doc(db, 'posts', id));
      return await storageService.getPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      return [];
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      if (querySnapshot.empty) {
        // Initialize with default categories
        for (const category of INITIAL_CATEGORIES) {
          await addDoc(collection(db, 'categories'), category);
        }
        return INITIAL_CATEGORIES;
      }
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  saveCategory: async (category: Category): Promise<Category[]> => {
    try {
      await addDoc(collection(db, 'categories'), category);
      return await storageService.getCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      return [];
    }
  },

  deleteCategory: async (id: string): Promise<Category[]> => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return await storageService.getCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      return [];
    }
  },
};
