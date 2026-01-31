import React, { useState } from 'react';
import { Copy, Download, Trash2, Check, Heart, MessageCircle, Send, Bookmark, Battery, Wifi, MoreHorizontal, Share2, X, Link as LinkIcon, Mail, Pencil } from 'lucide-react';
import { Post, Category, UserRole } from '../types';
import { Button } from './Button';

interface PostCardProps {
  post: Post;
  category: Category;
  role: UserRole;
  onDelete?: (id: string) => void;
  onEdit?: (post: Post) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, category, role, onDelete, onEdit, onShowToast }) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      onShowToast("Testo copiato negli appunti!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      onShowToast("Errore durante la copia del testo.", "error");
    }
  };

  const handleDownload = async () => {
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      
      // If it's a base64 string or simple URL, this usually works directly
      // For cross-origin, we fetch as blob to force download
      const response = await fetch(post.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      link.href = url;
      link.download = `pharmasocial-${post.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onShowToast("Download immagine avviato.", "success");
    } catch (error) {
      // Fallback for direct links if fetch fails (e.g. CORS issues with picsum in some envs)
      const link = document.createElement('a');
      link.href = post.imageUrl;
      link.target = '_blank';
      link.download = 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast("Immagine aperta in una nuova scheda.", "success");
    }
  };

  const handleShareLink = () => {
    const fakeLink = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(fakeLink);
    onShowToast("Link copiato negli appunti!", "success");
    setShowShareModal(false);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Guarda questo post: ${post.title}`);
    const body = encodeURIComponent(`${post.content}\n\nScarica l'immagine qui: ${post.imageUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareModal(false);
  };

  // Format date relative or absolute
  const postDate = new Date(post.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col gap-4 group">
       {/* Phone Mockup Container */}
       {/* Outer shadow and border radius to simulate the physical device */}
       <div className="relative mx-auto w-full max-w-[300px] bg-gray-900 rounded-[2.5rem] border-[10px] border-gray-900 shadow-2xl ring-1 ring-white/10 overflow-hidden aspect-[9/19] transition-transform duration-300 hover:scale-[1.02]">
          
          {/* Status Bar Area (Notch) */}
          <div className="absolute top-0 inset-x-0 h-7 bg-white z-20 flex justify-center items-end pb-1 px-6">
               {/* The Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-xl z-30"></div>
              
              <div className="w-full flex justify-between items-center text-[10px] font-semibold text-gray-900 z-40">
                  <span className="pl-1">10:41</span>
                  <div className="flex gap-1.5 items-center pr-1">
                      <Wifi size={12} className="stroke-[2.5]" />
                      <Battery size={12} className="stroke-[2.5]" />
                  </div>
              </div>
          </div>
          
          {/* Screen Content */}
          <div className="bg-white w-full h-full overflow-y-auto no-scrollbar flex flex-col pt-8 relative">
              
              {/* Fake App Header */}
              <div className="h-10 border-b border-gray-50 flex items-center justify-between px-4 sticky top-0 bg-white z-10 shrink-0">
                  <span className="font-bold text-sm tracking-tight">SocialFeed</span>
                  <div className="w-6"></div> {/* Spacer for centering if needed, or icons */}
              </div>

              {/* Post Item */}
              <div className="flex flex-col pb-4">
                  {/* User Row */}
                  <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-blue-600 p-[2px]">
                              <div className="w-full h-full rounded-full bg-white border-2 border-white overflow-hidden relative">
                                  {/* Generic Avatar Icon */}
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px]">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 24H0V22C0 17.5817 3.58172 14 8 14H16C20.4183 14 24 17.5817 24 22V24Z"/><circle cx="12" cy="6" r="6"/></svg>
                                  </div>
                              </div>
                          </div>
                          <div className="flex flex-col justify-center">
                              <span className="text-xs font-semibold text-gray-900 leading-none mb-0.5">LaTuaFarmacia</span>
                              <span className="text-[10px] text-gray-500 leading-none">{category?.name}</span>
                          </div>
                      </div>
                      <MoreHorizontal size={16} className="text-gray-400" />
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-gray-50 relative">
                       <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                  </div>

                  {/* Actions */}
                  <div className="px-3 py-2">
                      <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-3">
                              <Heart size={22} className="text-gray-900 hover:text-red-500 transition-colors cursor-pointer" />
                              <MessageCircle size={22} className="text-gray-900 -rotate-90" />
                              <Send size={22} className="text-gray-900 -rotate-12" />
                              <button onClick={() => setShowShareModal(true)} className="focus:outline-none" title="Condividi">
                                <Share2 size={22} className="text-gray-900 hover:text-teal-600 transition-colors" />
                              </button>
                          </div>
                          <Bookmark size={22} className="text-gray-900" />
                      </div>
                      
                      <div className="text-xs font-bold text-gray-900 mb-1">
                          Piace a 42 persone
                      </div>

                      {/* Caption */}
                      <div className="text-xs text-gray-800 leading-relaxed">
                          <span className="font-bold mr-1.5">LaTuaFarmacia</span>
                          {post.content}
                      </div>
                      
                      <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">
                          {postDate}
                      </div>
                  </div>
              </div>

              {/* Share Modal Overlay (Inside Phone) */}
              {showShareModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                            <h3 className="font-bold text-gray-900 text-sm">Condividi su</h3>
                            <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={handleShareLink}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                                    <LinkIcon size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Copia Link</span>
                            </button>
                            <button 
                                onClick={handleShareEmail}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                    <Mail size={20} />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Email</span>
                            </button>
                        </div>
                    </div>
                </div>
              )}
          </div>
       </div>

       {/* Control Panel (Outside Phone) */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mx-auto w-full max-w-[300px]">
            <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="font-bold text-gray-800 text-sm leading-tight">{post.title}</h3>
            </div>
            
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        variant="secondary" 
                        className="text-xs py-1.5 px-2 h-9" 
                        onClick={handleCopy}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copiato' : 'Copia'}
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        className="text-xs py-1.5 px-2 h-9" 
                        onClick={handleDownload}
                    >
                        <Download size={14} />
                        Scarica
                    </Button>
                </div>

                {role === 'admin' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                      {onEdit && (
                         <Button 
                            variant="secondary" 
                            className="w-full text-xs py-1.5 h-9"
                            onClick={() => onEdit(post)}
                            title="Modifica post"
                        >
                            <Pencil size={14} />
                            Modifica
                        </Button>
                      )}
                      
                      {onDelete && (
                        <Button 
                            variant="danger" 
                            className="w-full text-xs py-1.5 h-9"
                            onClick={() => onDelete(post.id)}
                            title="Elimina post"
                        >
                            <Trash2 size={14} />
                            Elimina
                        </Button>
                      )}
                  </div>
                )}
            </div>
       </div>
    </div>
  );
};
