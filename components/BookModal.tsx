import React, { useState } from 'react';
import { Book, User } from '../types';
import { X, Send, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface BookModalProps {
  book: Book;
  currentUser: User | null;
  onClose: () => void;
  onAddComment: (bookId: string, text: string) => void;
  onRequestSwap: (book: Book) => void;
  hasPendingSwap: boolean;
  onProfileClick?: (userId: string) => void;
}

export const BookModal: React.FC<BookModalProps> = ({ 
  book, 
  currentUser, 
  onClose, 
  onAddComment, 
  onRequestSwap,
  hasPendingSwap,
  onProfileClick
}) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(book.id, commentText);
      setCommentText('');
    }
  };

  const isOwner = currentUser?.id === book.owner.id;

  const handleProfileClick = (userId: string) => {
    if (onProfileClick) {
      onProfileClick(userId);
      onClose(); // Close modal when navigating to profile
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-library-navy/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-library-navy dark:hover:text-white bg-white/80 dark:bg-slate-900/80 rounded-full p-2 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left: Image */}
        <div className="w-full md:w-2/5 bg-gray-100 dark:bg-slate-900 relative">
            <img 
              src={book.imageUrl} 
              alt={book.title} 
              className="w-full h-64 md:h-full object-cover"
            />
        </div>

        {/* Right: Details & Discussion */}
        <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto custom-scrollbar flex flex-col bg-white dark:bg-slate-800">
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-library-orange/10 text-library-orange text-xs font-bold rounded-full uppercase tracking-wider">
                {book.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 text-xs font-bold rounded-full uppercase tracking-wider">
                {book.condition}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-library-navy dark:text-white mb-2">{book.title}</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-serif italic mb-6">{book.author}</p>
            
            <p className="text-library-navy/80 dark:text-gray-300 leading-relaxed font-sans mb-8">
              {book.description}
            </p>

            {/* Owner & Action Box */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-700">
              <div 
                className={`flex items-center gap-3 ${onProfileClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => handleProfileClick(book.owner.id)}
              >
                <img src={book.owner.avatar} alt={book.owner.name} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm" />
                <div>
                  <p className="text-sm font-bold text-library-navy dark:text-white hover:text-library-orange transition-colors">{book.owner.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Est. Value: {book.price}</p>
                </div>
              </div>
              
              <div className="text-right">
                 {currentUser && !isOwner && book.status === 'available' && (
                   <Button 
                    variant={hasPendingSwap ? "secondary" : "action"} 
                    onClick={() => !hasPendingSwap && onRequestSwap(book)}
                    disabled={hasPendingSwap}
                    className="text-sm"
                   >
                     {hasPendingSwap ? (
                       <><CheckCircle2 size={16} /> Requested</>
                     ) : (
                       <><ArrowLeftRight size={16} /> Request Swap</>
                     )}
                   </Button>
                 )}
                 {isOwner && (
                   <span className="text-xs bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">You own this</span>
                 )}
                 {book.status === 'swapped' && (
                   <span className="text-xs bg-library-navy text-white px-3 py-1 rounded-full">Unavailable</span>
                 )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 flex flex-col border-t border-gray-100 dark:border-slate-700 pt-6">
            <h3 className="font-serif text-xl text-library-navy dark:text-white mb-4 flex items-center gap-2">
              Discussion 
              <span className="text-sm font-sans text-gray-400">({book.comments.length})</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 max-h-[250px]">
              {book.comments.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No comments yet. Start the negotiation.</p>
              ) : (
                book.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className={`flex items-center gap-2 ${onProfileClick ? 'cursor-pointer' : ''}`}
                        onClick={() => handleProfileClick(comment.userId)}
                      >
                        <span className="text-sm font-bold text-library-navy dark:text-gray-200 hover:text-library-orange transition-colors">{comment.userName}</span>
                        <span className="text-xs text-gray-400">{comment.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {currentUser ? (
              <form onSubmit={handleSubmit} className="relative mt-auto">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ask a question or propose a trade..."
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg py-3 pl-4 pr-12 text-library-navy dark:text-white focus:outline-none focus:border-library-orange focus:ring-1 focus:ring-library-orange transition-all"
                />
                <button 
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-library-orange disabled:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm text-gray-500">
                Log in to comment
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};