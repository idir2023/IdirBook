import React from 'react';
import { Book } from '../types';
import { MessageCircle } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  onProfileClick?: (userId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick, onProfileClick }) => {
  
  const handleProfileClick = (e: React.MouseEvent) => {
    if (onProfileClick) {
      e.stopPropagation(); // Prevent opening the book modal
      onProfileClick(book.owner.id);
    }
  };

  return (
    <div 
      onClick={() => onClick(book)}
      className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer shadow-soft hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-slate-700"
    >
      {/* Image Container */}
      <div className="aspect-[2/3] overflow-hidden relative bg-gray-100 dark:bg-slate-900">
        <img 
          src={book.imageUrl} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {book.status === 'swapped' && (
          <div className="absolute inset-0 bg-library-navy/80 flex items-center justify-center">
            <span className="text-white font-serif text-xl border-2 border-white px-4 py-2 rounded">SWAPPED</span>
          </div>
        )}
        
        {/* Price/Value Tag */}
        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-library-navy dark:text-white shadow-sm border border-gray-100 dark:border-slate-700">
          {book.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-library-orange text-xs font-bold uppercase tracking-wider mb-1">
          {book.category}
        </p>
        <h3 className="font-serif text-xl text-library-navy dark:text-white font-bold mb-1 line-clamp-1 leading-tight group-hover:text-library-orange transition-colors">
          {book.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-medium">
          {book.author}
        </p>

        <div className="flex items-center justify-between text-gray-400 text-sm pt-4 border-t border-gray-100 dark:border-slate-700">
          <div 
            className={`flex items-center gap-2 ${onProfileClick ? 'hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full pr-2 -ml-1 py-1 transition-colors cursor-pointer' : ''}`}
            onClick={handleProfileClick}
            title={onProfileClick ? "View Profile" : undefined}
          >
            <img src={book.owner.avatar} alt={book.owner.name} className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-slate-600"/>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[80px] group-hover:text-library-navy dark:group-hover:text-gray-200 transition-colors">
              {book.owner.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MessageCircle size={14} />
            <span className="text-xs">{book.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};