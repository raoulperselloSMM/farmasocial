import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, LogOut, Plus, Image as ImageIcon, Sparkles, Search, Filter, X, Check, FolderPlus, Lock, Mail, LogIn, ArrowRight, Trash2, Upload, Loader2 } from 'lucide-react';
import { UserRole, Post, Category, Toast } from './types';
import { storageService } from './services/storage';
import { generatePostCaption, generatePostImage } from './services/gemini';
import { PostCard } from './components/PostCard';
import { Button } from './components/Button';

// Color presets for categories
const CATEGORY_COLORS = [
  { label: 'Blu', value: 'bg-blue-100 text-blue-800', bg: 'bg-blue-100' },
  { label: 'Verde', value: 'bg-green-100 text-green-800', bg: 'bg-green-100' },
  { label: 'Rosso', value: 'bg-red-100 text-red-800', bg: 'bg-red-100' },
  { label: 'Giallo', value: 'bg-yellow-100 text-yellow-800', bg: 'bg-yellow-100' },
  { label: 'Viola', value: 'bg-purple-100 text-purple-800', bg: 'bg-purple-100' },
  { label: 'Rosa', value: 'bg-pink-100 text-pink-800', bg: 'bg-pink-100' },
  { label: 'Indaco', value: 'bg-indigo-100 text-indigo-800', bg: 'bg-indigo-100' },
  { label: 'Arancio', value: 'bg-orange-100 text-orange-800', bg: 'bg-orange-100' },
  { label: 'Teal', value: 'bg-teal-100 text-teal-800', bg: 'bg-teal-100' },
];

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin State - Posts
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostCategory, setNewPostCategory] = useState<string>('');
  
  // AI States
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin State - Categories
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0].value);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- INITIALIZATION ---
  useEffect(() => {
    setPosts(storageService.getPosts());
    setCategories(storageService.getCategories());
  }, []);

  // --- ACTIONS ---

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEMO CREDENTIALS LOGIC
    // Unified login: check credentials and assign role accordingly
    if (email === 'admin@social.it' && password === 'admin') {
      setRole('admin');
      showToast('Benvenuto Admin!', 'success');
    } else if (email === 'farmacia@rossi.it' && password === 'farmacia') {
      setRole('client');
      showToast('Benvenuto Farmacia Rossi', 'success');
    } else {
      showToast('Credenziali non valide', 'error');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setEmail('');
    setPassword('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    if (!newPostTitle || !newPostCategory) {
      showToast("Inserisci un titolo e seleziona una categoria per usare l'AI.", "error");
      return;
    }
    
    setIsGeneratingAI(true);
    const categoryName = categories.find(c => c.id === newPostCategory)?.name || 'Generale';
    const generatedText = await generatePostCaption(newPostTitle, categoryName);
    
    if (generatedText) {
      setNewPostContent(generatedText);
      showToast("Testo generato con successo!", "success");
    } else {
      showToast("Errore nella generazione AI. Controlla la chiave API.", "error");
    }
    setIsGeneratingAI(false);
  };

  const handleGenerateImage = async () => {
    if (!newPostTitle || !newPostCategory) {
        showToast("Inserisci un titolo e seleziona una categoria per generare l'immagine.", "error");
        return;
    }

    setIsGeneratingImage(true);
    const categoryName = categories.find(c => c.id === newPostCategory)?.name || 'Generale';
    const generatedImageBase64 = await generatePostImage(newPostTitle, categoryName);

    if (generatedImageBase64) {
        setNewPostImage(generatedImageBase64);
        showToast("Immagine generata con successo!", "success");
    } else {
        showToast("Impossibile generare l'immagine. Riprova più tardi.", "error");
    }
    setIsGeneratingImage(false);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent || !newPostImage || !newPostCategory) {
      showToast("Compila tutti i campi obbligatori.", "error");
      return;
    }

    if (editingPostId) {
        // UPDATE EXISTING
        const updatedPost: Post = {
            id: editingPostId,
            title: newPostTitle,
            content: newPostContent,
            imageUrl: newPostImage,
            categoryId: newPostCategory,
            createdAt: posts.find(p => p.id === editingPostId)?.createdAt || Date.now(), // Keep original date
        };
        const updatedPosts = storageService.updatePost(updatedPost);
        setPosts(updatedPosts);
        showToast("Contenuto modificato con successo!", "success");

    } else {
        // CREATE NEW
        const newPost: Post = {
            id: Date.now().toString(),
            title: newPostTitle,
            content: newPostContent,
            imageUrl: newPostImage,
            categoryId: newPostCategory,
            createdAt: Date.now(),
        };
        const updatedPosts = storageService.savePost(newPost);
        setPosts(updatedPosts);
        showToast("Contenuto pubblicato con successo!", "success");
    }

    setIsAddingPost(false);
    resetForm();
  };

  const handleEditPost = (post: Post) => {
      setEditingPostId(post.id);
      setNewPostTitle(post.title);
      setNewPostContent(post.content);
      setNewPostImage(post.imageUrl);
      setNewPostCategory(post.categoryId);
      setIsAddingPost(true);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) {
      showToast("Il nome della categoria è obbligatorio.", "error");
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCatName,
      color: newCatColor
    };

    const updatedCategories = storageService.saveCategory(newCategory);
    setCategories(updatedCategories);
    setIsAddingCategory(false);
    setNewCatName('');
    setNewCatColor(CATEGORY_COLORS[0].value);
    showToast("Nuova categoria creata!", "success");
  };

  const handleDeletePost = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo contenuto? L'azione è irreversibile.")) {
        const updatedPosts = storageService.deletePost(id);
        setPosts(updatedPosts);
        showToast("Contenuto eliminato definitivamente.", "success");
    }
  };

  const handleDeleteCategory = (id: string) => {
    // Check if posts exist in this category
    const hasPosts = posts.some(p => p.categoryId === id);
    const confirmMessage = hasPosts 
        ? "Attenzione: ci sono contenuti associati a questa categoria. Se procedi, i post rimarranno ma senza categoria. Vuoi eliminare la categoria?"
        : "Sei sicuro di voler eliminare questa categoria?";

    if (confirm(confirmMessage)) {
        const updatedCategories = storageService.deleteCategory(id);
        setCategories(updatedCategories);
        if (selectedCategory === id) setSelectedCategory('all');
        showToast("Categoria eliminata.", "success");
    }
  };

  const resetForm = () => {
    setEditingPostId(null);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImage(null);
    setNewPostCategory('');
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const openNewPostModal = () => {
      resetForm();
      setIsAddingPost(true);
  };

  // --- FILTERING ---
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- RENDER HELPERS ---

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
            {/* Logo Header */}
            <div className="bg-teal-600 p-8 text-center text-white">
                <div className="inline-flex bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-sm">
                   <LayoutDashboard size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">PharmaSocial</h1>
                <p className="text-teal-100 text-sm mt-1">Piattaforma Content Management</p>
            </div>

            {/* Login Form */}
            <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                placeholder="es. farmacia@rossi.it o admin@social.it"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                        Accedi <ArrowRight size={18} />
                    </button>

                    <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
                        <p className="font-semibold mb-1">Credenziali Demo:</p>
                        <p>Farmacia: farmacia@rossi.it / farmacia</p>
                        <p>Admin: admin@social.it / admin</p>
                    </div>
                </form>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                    <LayoutDashboard size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent hidden sm:inline-block">
                    PharmaSocial
                </span>
                <span className="ml-0 sm:ml-2 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                    {role === 'admin' ? 'Admin Panel' : 'Portale Farmacia'}
                </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {role === 'admin' && (
                    <>
                      <Button onClick={() => setIsAddingCategory(true)} variant="secondary" className="hidden md:flex">
                          <FolderPlus size={18} /> <span className="hidden lg:inline">Nuova Cat.</span>
                      </Button>
                      <Button onClick={openNewPostModal}>
                          <Plus size={18} /> <span className="hidden sm:inline">Nuovo Post</span>
                      </Button>
                    </>
                )}
                <div className="h-8 w-px bg-gray-200 mx-1"></div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 flex items-center gap-2 text-sm font-medium transition-colors"
                  title="Esci"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Esci</span>
                </button>
            </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* FILTERS & SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Cerca contenuti..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar items-center">
                <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    Tutti
                </button>
                {categories.map(cat => (
                    <div key={cat.id} className="relative group">
                        <button 
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors pr-8 ${selectedCategory === cat.id ? 'ring-2 ring-offset-2 ring-teal-500 bg-white border-transparent' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                            style={{ color: selectedCategory === cat.id ? 'black' : undefined }}
                        >
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${cat.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                            {cat.name}
                        </button>
                        {role === 'admin' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                title="Elimina categoria"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* POSTS GRID */}
        {filteredPosts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900">Nessun contenuto trovato</h3>
                <p className="text-gray-500 mt-2">Prova a cambiare i filtri o la ricerca.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                    <PostCard 
                        key={post.id}
                        post={post}
                        category={categories.find(c => c.id === post.categoryId) as Category}
                        role={role}
                        onDelete={handleDeletePost}
                        onEdit={handleEditPost}
                        onShowToast={showToast}
                    />
                ))}
            </div>
        )}
      </main>

      {/* ADMIN MODAL: ADD CATEGORY */}
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Nuova Categoria</h2>
                    <button onClick={() => setIsAddingCategory(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Nome Categoria</label>
                        <input 
                            type="text"
                            required
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="Es. Dermocosmesi"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Colore Etichetta</label>
                        <div className="grid grid-cols-5 gap-3 mt-2">
                            {CATEGORY_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setNewCatColor(color.value)}
                                    className={`w-10 h-10 rounded-full ${color.bg} border-2 transition-all flex items-center justify-center ${
                                        newCatColor === color.value 
                                        ? 'border-gray-600 scale-110 shadow-sm' 
                                        : 'border-transparent hover:scale-105'
                                    }`}
                                    title={color.label}
                                >
                                    {newCatColor === color.value && <Check size={16} className="text-gray-700" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddingCategory(false)} className="flex-1">
                            Annulla
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Crea Categoria
                        </Button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* ADMIN MODAL: ADD/EDIT POST */}
      {isAddingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editingPostId ? 'Modifica Contenuto' : 'Nuovo Contenuto'}
                    </h2>
                    <button onClick={() => setIsAddingPost(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSavePost} className="p-6 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Titolo (Argomento)</label>
                            <input 
                                type="text"
                                required
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                placeholder="Es. Promozione Solari"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Categoria</label>
                            <div className="flex gap-2">
                                <select 
                                    required
                                    value={newPostCategory}
                                    onChange={(e) => setNewPostCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">Seleziona categoria...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingPost(false);
                                        setIsAddingCategory(true);
                                    }}
                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                    title="Crea nuova categoria"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload / Generation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                             <label className="block text-sm font-medium text-gray-700">Immagine del Post</label>
                             <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs flex items-center gap-1 text-gray-600 hover:text-teal-600 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200"
                                >
                                    <Upload size={14} /> Carica File
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleGenerateImage}
                                    disabled={isGeneratingImage || !newPostTitle || !newPostCategory}
                                    className="text-xs flex items-center gap-1 text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 font-medium px-2 py-1 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isGeneratingImage ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    Genera Immagine AI
                                </button>
                             </div>
                        </div>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 transition-colors relative flex items-center justify-center min-h-[200px]">
                            {isGeneratingImage ? (
                                <div className="flex flex-col items-center gap-3 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    <div className="h-4 bg-gray-200 w-32 rounded"></div>
                                    <p className="text-sm text-gray-400">Creazione immagine in corso...</p>
                                </div>
                            ) : newPostImage ? (
                                <div className="relative group w-full h-full">
                                    <img src={newPostImage} alt="Preview" className="mx-auto h-48 object-contain rounded-lg shadow-sm" />
                                    <button 
                                        type="button"
                                        onClick={() => setNewPostImage(null)}
                                        className="absolute top-0 right-0 p-1 bg-white rounded-full shadow text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Rimuovi immagine"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <ImageIcon size={48} className="mb-2 text-gray-300" />
                                    <span className="text-sm font-medium">Nessuna immagine selezionata</span>
                                    <span className="text-xs text-gray-400 mt-1">Usa i pulsanti sopra per caricare o generare</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">Testo del Post (Copy)</label>
                            <button 
                                type="button" 
                                onClick={handleGenerateAI}
                                disabled={isGeneratingAI || !newPostTitle || !newPostCategory}
                                className="text-xs flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Sparkles size={14} />
                                Genera con AI
                            </button>
                        </div>
                        <textarea 
                            required
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                            placeholder="Scrivi qui il testo del post..."
                        />
                         <p className="text-xs text-gray-500 text-right">
                           {isGeneratingAI ? 'Generazione in corso...' : 'L\'AI può aiutarti a scrivere una bozza.'}
                         </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddingPost(false)} className="flex-1">
                            Annulla
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            {editingPostId ? 'Salva Modifiche' : 'Pubblica Contenuto'}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
            <div 
                key={toast.id}
                className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-slide-up ${
                    toast.type === 'success' ? 'bg-teal-600' : 'bg-red-500'
                }`}
            >
                {/* Fixed: Check was missing from imports */}
                {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
                {toast.message}
            </div>
        ))}
      </div>

    </div>
  );
};

export default App;