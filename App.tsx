import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookModal } from './components/BookModal';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfile } from './components/UserProfile';
import { User, Book, ViewState, Swap } from './types';
import { Button } from './components/Button';
import { api } from './services/api';
import { locker } from './services/storage';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import Swal from 'sweetalert2';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('marketplace');
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For Admin View
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sort State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Art', 'Philosophy'];
  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];

  // Derived state for notifications
  const notificationCount = swaps.filter(s => s.ownerId === user?.id && s.status === 'pending').length;

  // --- Initialization & Session Restore ---
  useEffect(() => {
    const initApp = async () => {
      // 1. Restore Theme
      const savedTheme = locker.getTheme();
      setTheme(savedTheme);
      applyTheme(savedTheme);

      // 2. Restore Session
      try {
        const sessionUser = await api.auth.getCurrentSession();
        if (sessionUser) {
          setUser(sessionUser);
          if (sessionUser.isAdmin) setView('admin'); // Optional: redirect admins on load
        }
      } catch (e) {
        console.error("Session restore failed", e);
      }

      // 3. Load Data
      await loadData();
    };

    initApp();
  }, []);

  // Fetch users if logged in as admin
  useEffect(() => {
    if (user?.isAdmin) {
      api.users.getAll().then(setAllUsers);
    }
  }, [user, view]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedBooks, fetchedSwaps] = await Promise.all([
        api.books.getAll(),
        api.swaps.getAll()
      ]);
      setBooks(fetchedBooks);
      setSwaps(fetchedSwaps);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    locker.setTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleNavigate = (newView: ViewState) => {
    if (newView !== 'profile') {
      setViewProfileId(null);
    }
    setView(newView);
    setSelectedBook(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProfile = (userId: string) => {
    setViewProfileId(userId);
    handleNavigate('profile');
  };

  const handleLogout = async () => {
    await api.auth.logout();
    Swal.fire({
      title: 'Signed Out',
      text: 'See you next time!',
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
      color: theme === 'dark' ? '#fff' : '#143628'
    });
    setUser(null);
    handleNavigate('marketplace');
  };

  // --- API Handlers ---

  const handleAuthLogin = async (email: string, password?: string) => {
    try {
      const loggedUser = await api.auth.login(email, password);
      setUser(loggedUser);
      const currentSwaps = await api.swaps.getAll();
      setSwaps(currentSwaps);
      // Determine landing page
      handleNavigate(loggedUser.isAdmin ? 'admin' : 'marketplace');
      
      Swal.fire({
        title: `Welcome back, ${loggedUser.name.split(' ')[0]}!`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: theme === 'dark' ? '#1e293b' : '#143628',
        color: '#fff',
        iconColor: '#C27803'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Login Failed',
        text: err.message || 'Please check your credentials and try again.',
        icon: 'error',
        confirmButtonColor: '#143628',
        background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
        color: theme === 'dark' ? '#fff' : '#143628'
      });
    }
  };

  const handleAuthRegister = async (name: string, email: string, password?: string) => {
    try {
      const newUser = await api.auth.register(name, email, password);
      setUser(newUser);
      handleNavigate('dashboard');
      Swal.fire({
        title: 'Welcome to IdirBook!',
        text: 'Your account has been successfully created.',
        icon: 'success',
        confirmButtonColor: '#143628',
        background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
        color: theme === 'dark' ? '#fff' : '#143628'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Registration Failed',
        text: err.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#143628',
        background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
        color: theme === 'dark' ? '#fff' : '#143628'
      });
    }
  };

  const handleAddBook = async (bookData: Partial<Book>) => {
    if (!user) return;
    try {
      const newBook = await api.books.create(bookData, user);
      setBooks(prev => [newBook, ...prev]);
      handleNavigate('marketplace');
    } catch (error) {
      console.error("Error creating book", error);
    }
  };

  const handleAddComment = async (bookId: string, text: string) => {
    if (!user) return;
    try {
      const newComment = await api.books.addComment(bookId, text, user);
      setBooks(prevBooks => prevBooks.map(book => {
        if (book.id === bookId) {
          return { ...book, comments: [...book.comments, newComment] };
        }
        return book;
      }));

      if (selectedBook && selectedBook.id === bookId) {
         setSelectedBook(prev => {
           if(!prev) return null;
           return { ...prev, comments: [...prev.comments, newComment] };
         });
      }
    } catch (error) {
      console.error("Error adding comment", error);
    }
  };

  const handleRequestSwap = async (book: Book) => {
    if (!user) return;

    // Use HTML in SweetAlert to capture both Location and Message
    const { value: formValues } = await Swal.fire({
      title: 'Request Swap',
      html: `
        <div class="text-left">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Location / Meeting Place</label>
          <input id="swal-location" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-1 focus:ring-[#C27803] focus:border-[#C27803] outline-none transition-colors" placeholder="e.g. Central Park, Downtown Library">
          
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message to Owner</label>
          <textarea id="swal-message" class="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-1 focus:ring-[#C27803] focus:border-[#C27803] outline-none resize-none transition-colors" placeholder="Hi! I am interested in swapping this book..."></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Send Request',
      confirmButtonColor: '#143628',
      cancelButtonColor: '#6b7280',
      background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
      color: theme === 'dark' ? '#fff' : '#143628',
      preConfirm: () => {
        const locationInput = document.getElementById('swal-location') as HTMLInputElement;
        const messageInput = document.getElementById('swal-message') as HTMLTextAreaElement;
        
        if (!locationInput.value) {
          Swal.showValidationMessage('Please enter a location or meeting place');
          return false;
        }
        
        return {
          location: locationInput.value,
          message: messageInput.value
        };
      }
    });

    if (!formValues) return;

    try {
      const newSwap = await api.swaps.create(
        book, 
        user, 
        formValues.message || 'I am interested in swapping this book!',
        formValues.location
      );
      
      setSwaps(prev => [...prev, newSwap]);
      Swal.fire({
        title: 'Request Sent!',
        text: `The owner has been notified. They will see your location (${formValues.location}) and message.`,
        icon: 'success',
        confirmButtonColor: '#143628',
        background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
        color: theme === 'dark' ? '#fff' : '#143628'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to request swap. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#143628',
        background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
        color: theme === 'dark' ? '#fff' : '#143628'
      });
    }
  };

  const handleAcceptSwap = async (swapId: string) => {
    const result = await Swal.fire({
      title: 'Accept Swap Request?',
      text: 'This will mark the book as swapped and notify the requester.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#143628',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, accept swap',
      background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
      color: theme === 'dark' ? '#fff' : '#143628'
    });

    if (!result.isConfirmed) return;

    try {
      const updatedSwap = await api.swaps.updateStatus(swapId, 'accepted');
      if (updatedSwap) {
        setSwaps(prev => prev.map(s => s.id === swapId ? updatedSwap : s));
        setBooks(prev => prev.map(b => b.id === updatedSwap.bookId ? { ...b, status: 'swapped' } : b));
        
        Swal.fire({
          title: 'Swap Accepted!',
          text: 'The book is now marked as unavailable. You can coordinate final meeting details in the comments.',
          icon: 'success',
          confirmButtonColor: '#143628',
          background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
          color: theme === 'dark' ? '#fff' : '#143628'
        });
      }
    } catch (error) {
       Swal.fire({
         title: 'Error',
         text: 'Failed to accept swap',
         icon: 'error',
         background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
         color: theme === 'dark' ? '#fff' : '#143628'
       });
    }
  };

  const handleRejectSwap = async (swapId: string) => {
    const result = await Swal.fire({
      title: 'Decline Swap Request?',
      text: 'Are you sure you want to decline this request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#143628',
      confirmButtonText: 'Yes, decline',
      background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
      color: theme === 'dark' ? '#fff' : '#143628'
    });

    if (!result.isConfirmed) return;

    try {
      const updatedSwap = await api.swaps.updateStatus(swapId, 'rejected');
      if (updatedSwap) {
        setSwaps(prev => prev.map(s => s.id === swapId ? updatedSwap : s));
        Swal.fire({
          title: 'Declined',
          text: 'The swap request has been rejected.',
          icon: 'info',
          confirmButtonColor: '#143628',
          background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
          color: theme === 'dark' ? '#fff' : '#143628'
        });
      }
    } catch (error) {
      Swal.fire({
         title: 'Error',
         text: 'Failed to reject swap',
         icon: 'error',
         background: theme === 'dark' ? '#1e293b' : '#F2F0E9',
         color: theme === 'dark' ? '#fff' : '#143628'
       });
    }
  };

  // --- Admin Handlers ---
  const handleDeleteUser = async (userId: string) => {
    try {
        await api.users.delete(userId);
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        setBooks(prev => prev.filter(b => b.owner.id !== userId));
        setSwaps(prev => prev.filter(s => s.requesterId !== userId && s.ownerId !== userId));
    } catch (error) {
        console.error("Failed to delete user", error);
    }
  };

  const handleUpdateUserRole = async (userId: string, isAdmin: boolean) => {
    try {
        const updatedUser = await api.users.updateRole(userId, isAdmin);
        if (updatedUser) {
            setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        }
    } catch (error) {
        console.error("Failed to update user role", error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
        await api.books.delete(bookId);
        setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (error) {
        console.error("Failed to delete book", error);
    }
  };

  const hasPendingSwapForSelected = selectedBook && user 
    ? swaps.some(s => s.bookId === selectedBook.id && s.requesterId === user.id && s.status === 'pending')
    : false;

  // --- Filtering & Sorting Logic ---
  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesCondition = selectedCondition === 'All' || book.condition === selectedCondition;
    return matchesCategory && matchesCondition;
  });

  const getPriceValue = (priceStr: string) => {
    if (!priceStr) return 0;
    if (priceStr.toLowerCase().includes('swap')) return 0;
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const options: Intl.CollatorOptions = { numeric: true, sensitivity: 'base' };
    switch (sortBy) {
        case 'title_asc': return a.title.localeCompare(b.title, undefined, options);
        case 'title_desc': return b.title.localeCompare(a.title, undefined, options);
        case 'author_asc': return a.author.localeCompare(b.author, undefined, options);
        case 'author_desc': return b.author.localeCompare(a.author, undefined, options);
        case 'price_asc': return getPriceValue(a.price) - getPriceValue(b.price);
        case 'price_desc': return getPriceValue(b.price) - getPriceValue(a.price);
        default: return 0; // Keep existing order (Newest)
    }
  });

  return (
    <div className="min-h-screen bg-library-paper dark:bg-library-darkPaper text-library-navy dark:text-library-darkNavy font-sans selection:bg-library-orange/20 transition-colors duration-300">
      <Navbar 
        user={user} 
        currentView={view} 
        onNavigate={handleNavigate} 
        onLogin={() => handleNavigate('login')}
        onLogout={handleLogout}
        notificationCount={notificationCount}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'marketplace' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-library-navy dark:text-white mb-4">Discover Your Next Read</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Join a community of book lovers. Exchange your read books for new adventures. 
              </p>
            </div>

            {/* Filter Bar - Sticky */}
            <div className="sticky top-20 z-30 bg-library-paper/95 dark:bg-library-darkPaper/95 backdrop-blur-md py-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0 border-y border-library-navy/10 dark:border-white/10 shadow-sm transition-all">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                 {/* Categories (Horizontal Scroll) */}
                 <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto items-center" role="group" aria-label="Book Categories">
                    <div className="flex items-center text-library-navy/50 dark:text-white/50 mr-2 flex-shrink-0">
                       <Filter size={18} aria-hidden="true" />
                       <span className="sr-only">Filter by Category</span>
                    </div>
                    {categories.map(cat => (
                       <button 
                         key={cat}
                         onClick={() => setSelectedCategory(cat)}
                         aria-pressed={selectedCategory === cat}
                         className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-library-orange/50 ${
                           selectedCategory === cat 
                           ? 'bg-library-navy dark:bg-library-orange text-white shadow-md' 
                           : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                         }`}
                       >
                         {cat}
                       </button>
                    ))}
                 </div>

                 {/* Filters and Sorting */}
                 <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
                    
                    {/* Sort Dropdown */}
                    <div className="relative">
                      <label htmlFor="sort-select" className="sr-only">Sort by</label>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-library-orange/50">
                          <ArrowUpDown size={16} className="text-gray-400" aria-hidden="true" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline" aria-hidden="true">Sort</span>
                          <select 
                             id="sort-select"
                             value={sortBy}
                             onChange={(e) => setSortBy(e.target.value)}
                             className="bg-transparent dark:bg-slate-800 text-sm font-medium text-library-navy dark:text-gray-200 outline-none cursor-pointer hover:text-library-orange transition-colors pr-2"
                          >
                             <option value="newest">Newest</option>
                             <option value="title_asc">Title (A-Z)</option>
                             <option value="title_desc">Title (Z-A)</option>
                             <option value="author_asc">Author (A-Z)</option>
                             <option value="author_desc">Author (Z-A)</option>
                             <option value="price_asc">Price (Low-High)</option>
                             <option value="price_desc">Price (High-Low)</option>
                          </select>
                      </div>
                    </div>

                    {/* Condition Dropdown */}
                    <div className="relative">
                      <label htmlFor="condition-select" className="sr-only">Filter by Condition</label>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-library-orange/50">
                          <SlidersHorizontal size={16} className="text-gray-400" aria-hidden="true" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline" aria-hidden="true">Condition</span>
                          <select 
                             id="condition-select"
                             value={selectedCondition}
                             onChange={(e) => setSelectedCondition(e.target.value)}
                             className="bg-transparent dark:bg-slate-800 text-sm font-medium text-library-navy dark:text-gray-200 outline-none cursor-pointer hover:text-library-orange transition-colors pr-2"
                          >
                             {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Results Count Indicator */}
              <div className="mt-2 text-right hidden md:block">
                  <span className="text-xs font-medium text-gray-400">
                      Showing {sortedBooks.length} result{sortedBooks.length !== 1 ? 's' : ''}
                  </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-library-orange border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {sortedBooks.map(book => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      onClick={setSelectedBook} 
                      onProfileClick={handleViewProfile}
                    />
                  ))}
                </div>
                {sortedBooks.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-xl font-serif text-gray-400">No books found matching your criteria.</p>
                    <button 
                      onClick={() => {setSelectedCategory('All'); setSelectedCondition('All'); setSortBy('newest');}}
                      className="mt-4 text-library-orange font-medium hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'profile' && viewProfileId && (
          <UserProfile 
            userId={viewProfileId} 
            currentViewer={user}
            onBookClick={setSelectedBook}
            onNavigateBack={() => handleNavigate('marketplace')}
          />
        )}

        {view === 'dashboard' && user && (
          <div className="animate-fade-in">
            <Dashboard 
              user={user} 
              onAddBook={handleAddBook} 
              swaps={swaps}
              onAcceptSwap={handleAcceptSwap}
              onRejectSwap={handleRejectSwap}
            />
          </div>
        )}

        {view === 'admin' && user?.isAdmin && (
           <AdminDashboard 
              users={allUsers}
              books={books}
              onDeleteUser={handleDeleteUser}
              onDeleteBook={handleDeleteBook}
              onUpdateUserRole={handleUpdateUserRole}
              theme={theme}
           />
        )}

        {/* Access Denied for Dashboard/Admin if not logged in or authorized */}
        {((view === 'dashboard' && !user) || (view === 'admin' && (!user || !user.isAdmin))) && (
          <div className="flex flex-col items-center justify-center py-20">
             <h3 className="text-2xl font-serif mb-4 text-library-navy dark:text-white">Access Restricted</h3>
             <p className="text-gray-500 mb-6">Please sign in with appropriate permissions to view this page.</p>
             <Button onClick={() => handleNavigate('login')} variant="action">Sign In</Button>
          </div>
        )}

        {view === 'login' && (
          <Login 
            onLogin={handleAuthLogin} 
            onNavigateRegister={() => handleNavigate('register')} 
          />
        )}

        {view === 'register' && (
          <Register 
            onRegister={handleAuthRegister} 
            onNavigateLogin={() => handleNavigate('login')} 
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="font-serif text-2xl text-library-navy dark:text-white font-bold mb-2">IdirBook</p>
          <p className="text-gray-400 text-sm">create by lahcen idir 2026 | Local Locker v1.0</p>
        </div>
      </footer>

      {selectedBook && (
        <BookModal 
          book={selectedBook} 
          currentUser={user}
          onClose={() => setSelectedBook(null)}
          onAddComment={handleAddComment}
          onRequestSwap={handleRequestSwap}
          hasPendingSwap={hasPendingSwapForSelected}
          onProfileClick={handleViewProfile}
        />
      )}
    </div>
  );
}

export default App;