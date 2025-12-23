import React, { useEffect, useState } from 'react';
import { User, Book } from '../types';
import { BookCard } from './BookCard';
import { api } from '../services/api';
import { Calendar, BookOpen, Mail, ArrowLeft } from 'lucide-react';

interface UserProfileProps {
  userId: string;
  currentViewer: User | null;
  onBookClick: (book: Book) => void;
  onNavigateBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  currentViewer, 
  onBookClick, 
  onNavigateBack 
}) => {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const user = await api.users.get(userId);
        if (user) {
          setProfileUser(user);
          // Fetch all books and filter by this user
          const allBooks = await api.books.getAll();
          setUserBooks(allBooks.filter(b => b.owner.id === userId));
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-10 w-10 border-4 border-library-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="text-2xl font-serif text-library-navy dark:text-white">User not found</h2>
        <button onClick={onNavigateBack} className="mt-4 text-library-orange hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Back Button */}
      <div className="mb-6 animate-slide-up">
        <button 
          onClick={onNavigateBack}
          className="flex items-center gap-2 text-gray-500 hover:text-library-orange transition-colors font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden mb-8 animate-slide-up">
        <div className="h-32 bg-library-navy dark:bg-slate-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12">
            <img 
              src={profileUser.avatar} 
              alt={profileUser.name} 
              className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-white object-cover"
            />
            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-serif font-bold text-library-navy dark:text-white">{profileUser.name}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  Joined {new Date(profileUser.joinedDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={16} />
                  {userBooks.length} Books Listed
                </span>
                {profileUser.isAdmin && (
                  <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-bold border border-purple-200 dark:border-purple-800">
                    Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Bookshelf */}
      <div className="animate-slide-up delay-100">
        <h3 className="text-2xl font-serif font-bold text-library-navy dark:text-white mb-6 pl-2 border-l-4 border-library-orange">
          {profileUser.id === currentViewer?.id ? 'My Bookshelf' : `${profileUser.name.split(' ')[0]}'s Bookshelf`}
        </h3>

        {userBooks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No books listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userBooks.map((book, index) => (
              <div 
                key={book.id} 
                className={`animate-slide-up`} 
                style={{ animationDelay: `${150 + (index * 50)}ms` }} // Inline staggered delay for books
              >
                <BookCard 
                  book={book} 
                  onClick={onBookClick}
                  onProfileClick={() => {}} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};