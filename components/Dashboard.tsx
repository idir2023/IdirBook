import React, { useState } from 'react';
import { User, Book, Swap } from '../types';
import { Button } from './Button';
import { Wand2, Upload, Book as BookIcon, LayoutList, ArrowLeftRight, Check, X, MapPin } from 'lucide-react';
import { enhanceBookDescription } from '../services/geminiService';
import Swal from 'sweetalert2';

interface DashboardProps {
  user: User;
  onAddBook: (bookData: Partial<Book>) => void;
  swaps: Swap[];
  onAcceptSwap: (swapId: string) => void;
  onRejectSwap: (swapId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onAddBook, swaps, onAcceptSwap, onRejectSwap }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'swaps'>('swaps');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    category: 'Fiction',
    condition: 'Good',
    imageUrl: ''
  });

  // Filter swaps where I am the owner (Incoming)
  const incomingSwaps = swaps.filter(s => s.ownerId === user.id && s.status === 'pending');
  // Filter swaps where I am the requester (Outgoing)
  const outgoingSwaps = swaps.filter(s => s.requesterId === user.id);

  const handleEnhance = async () => {
    if (!formData.title || !formData.author) return;
    setIsEnhancing(true);
    const enhanced = await enhanceBookDescription(formData.title, formData.author, formData.description || 'A classic book.');
    setFormData(prev => ({ ...prev, description: enhanced }));
    setIsEnhancing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBook({ ...formData, condition: formData.condition as any });
    setFormData({
      title: '', author: '', description: '', price: '', category: 'Fiction', condition: 'Good', imageUrl: ''
    });
    
    Swal.fire({
      title: 'Success!',
      text: 'Book successfully listed to the marketplace!',
      icon: 'success',
      confirmButtonColor: '#143628',
      background: '#F2F0E9',
      color: '#143628'
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-library-navy dark:text-white">My Dashboard</h2>
          <p className="text-gray-500">Manage your collection and swap requests.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 inline-flex shadow-sm">
          <button
            onClick={() => setActiveTab('swaps')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'swaps' ? 'bg-library-navy text-white shadow' : 'text-gray-500 hover:text-library-navy dark:text-gray-400 dark:hover:text-white'}`}
          >
            Swap Requests
            {incomingSwaps.length > 0 && <span className="ml-2 bg-library-orange text-white text-xs px-1.5 py-0.5 rounded-full">{incomingSwaps.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-library-navy text-white shadow' : 'text-gray-500 hover:text-library-navy dark:text-gray-400 dark:hover:text-white'}`}
          >
            List a Book
          </button>
        </div>
      </div>

      {activeTab === 'swaps' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incoming Requests */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-library-navy px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-serif text-white font-bold flex items-center gap-2">
                <ArrowLeftRight size={18} className="text-library-orange" />
                Incoming Requests
              </h3>
            </div>
            <div className="p-6">
              {incomingSwaps.length === 0 ? (
                 <p className="text-gray-400 text-center py-8">No pending requests for your books.</p>
              ) : (
                <div className="space-y-4">
                  {incomingSwaps.map(swap => (
                    <div key={swap.id} className="border border-gray-100 dark:border-slate-700 rounded-lg p-4 hover:border-library-orange/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                         <div>
                           <p className="text-sm text-gray-500 mb-1">Request for:</p>
                           <p className="font-serif font-bold text-library-navy dark:text-white">{swap.bookTitle}</p>
                         </div>
                         <span className="text-xs bg-orange-100 text-library-orange px-2 py-1 rounded font-medium">Pending</span>
                      </div>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                          {swap.requesterName.charAt(0)}
                        </div>
                        <div className="text-sm w-full">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{swap.requesterName}</p>
                          
                          {swap.requesterLocation && (
                            <div className="flex items-center gap-1.5 text-xs text-library-orange font-bold mt-1 mb-2">
                                <MapPin size={12} />
                                {swap.requesterLocation}
                            </div>
                          )}
                          
                          {swap.requesterMessage && (
                            <div className="bg-library-paper/50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-library-navy/80 dark:text-gray-300 italic relative mt-2">
                                <span className="absolute -top-1.5 left-2 bg-white dark:bg-slate-800 px-1 text-[10px] font-bold text-library-orange uppercase tracking-wider">Message</span>
                                "{swap.requesterMessage}"
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => onAcceptSwap(swap.id)} variant="action" className="flex-1 text-sm py-1.5">
                           <Check size={16} /> Accept
                        </Button>
                        <Button onClick={() => onRejectSwap(swap.id)} variant="secondary" className="flex-1 text-sm py-1.5 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600">
                           <X size={16} /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Outgoing Requests (History) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden">
             <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
              <h3 className="font-serif text-library-navy dark:text-white font-bold">My Requests History</h3>
            </div>
            <div className="p-6">
              {outgoingSwaps.length === 0 ? (
                <p className="text-gray-400 text-center py-8">You haven't requested any swaps yet.</p>
              ) : (
                 <div className="space-y-3">
                   {outgoingSwaps.map(swap => (
                     <div key={swap.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                       <div>
                         <p className="font-medium text-library-navy dark:text-white text-sm">{swap.bookTitle}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(swap.requestDate).toLocaleDateString()}</p>
                       </div>
                       <div>
                         {swap.status === 'pending' && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Pending</span>}
                         {swap.status === 'accepted' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Accepted</span>}
                         {swap.status === 'rejected' && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Declined</span>}
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-serif font-bold text-library-navy dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4 mb-6">List a New Book</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-library-navy dark:text-white focus:border-library-orange focus:ring-1 focus:ring-library-orange focus:outline-none transition-colors"
                  placeholder="The Great Gatsby"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Author</label>
                <input
                  required
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-library-navy dark:text-white focus:border-library-orange focus:ring-1 focus:ring-library-orange focus:outline-none transition-colors"
                  placeholder="F. Scott Fitzgerald"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Est. Value</label>
                <input
                  required
                  type="text"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-library-navy dark:text-white focus:border-library-orange focus:outline-none"
                  placeholder="$15 or Swap"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-library-navy dark:text-white focus:border-library-orange focus:outline-none"
                >
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Science</option>
                  <option>History</option>
                  <option>Art</option>
                  <option>Philosophy</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Condition</label>
                <select
                  value={formData.condition}
                  onChange={e => setFormData({...formData, condition: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-library-navy dark:text-white focus:border-library-orange focus:outline-none"
                >
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Description</label>
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !formData.title}
                  className="text-xs flex items-center gap-1 text-library-orange hover:text-orange-700 transition-colors disabled:opacity-50"
                >
                  <Wand2 size={12} />
                  {isEnhancing ? 'Consulting AI...' : 'AI Enhance'}
                </button>
              </div>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-library-navy dark:text-white focus:border-library-orange focus:ring-1 focus:ring-library-orange focus:outline-none transition-colors resize-none"
                placeholder="Describe the condition and plot..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Cover Image</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Upload size={32} className="mb-2" />
                      <span className="text-sm font-medium">Drop cover here or click to upload</span>
                    </div>
                </div>
                {formData.imageUrl && (
                  <div className="w-20 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600 shadow-sm">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="action" className="w-full py-3">
                <BookIcon size={18} />
                Publish to Marketplace
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};