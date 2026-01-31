import { Post, Category } from '../types';

const POSTS_KEY = 'pharmasocial_posts';
const CATEGORIES_KEY = 'pharmasocial_categories';

// Initial Mock Data to populate the app on first run
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
  getPosts: (): Post[] => {
    const data = localStorage.getItem(POSTS_KEY);
    if (!data) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(data);
  },

  savePost: (post: Post): Post[] => {
    const posts = storageService.getPosts();
    const newPosts = [post, ...posts];
    localStorage.setItem(POSTS_KEY, JSON.stringify(newPosts));
    return newPosts;
  },

  updatePost: (updatedPost: Post): Post[] => {
    const posts = storageService.getPosts();
    const newPosts = posts.map(post => post.id === updatedPost.id ? updatedPost : post);
    localStorage.setItem(POSTS_KEY, JSON.stringify(newPosts));
    return newPosts;
  },

  deletePost: (id: string): Post[] => {
    const posts = storageService.getPosts().filter((p) => p.id !== id);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return posts;
  },

  getCategories: (): Category[] => {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategory: (category: Category): Category[] => {
    const categories = storageService.getCategories();
    const newCategories = [...categories, category];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
    return newCategories;
  },

  deleteCategory: (id: string): Category[] => {
    const categories = storageService.getCategories().filter((c) => c.id !== id);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
  },
};
