import { Book, User, Swap, Comment } from '../types';
import { locker } from './storage';

// API Latency simulation for "real feel"
const DELAY = 400;

const delay = <T>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), DELAY));
};

export const api = {
  auth: {
    login: async (email: string, password?: string): Promise<User> => {
      const users = await locker.getUsers();
      // Users come back from locker with decrypted credentials
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
         throw new Error("User not found");
      }

      if (!password || user.password !== password) {
         throw new Error("Invalid credentials");
      }
      
      locker.setSession(user.id);
      return delay(user);
    },
    
    register: async (name: string, email: string, password?: string): Promise<User> => {
      // Check if email already exists
      const users = await locker.getUsers();
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered");
      }

      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        password: password, // Locker will encrypt this
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E67E22&color=fff`,
        joinedDate: new Date()
      };
      await locker.addUser(newUser);
      locker.setSession(newUser.id);
      return delay(newUser);
    },

    getCurrentSession: async (): Promise<User | null> => {
      const id = locker.getSession();
      if (!id) return null;
      const users = await locker.getUsers();
      return users.find(u => u.id === id) || null;
    },

    logout: async () => {
      locker.clearSession();
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      const users = await locker.getUsers();
      return delay(users);
    },
    get: async (id: string): Promise<User | undefined> => {
      // We use getUsers() to ensure we get the decrypted version of the user object consistent with the rest of the app
      const users = await locker.getUsers();
      const user = users.find(u => u.id === id);
      return delay(user);
    },
    delete: async (id: string): Promise<void> => {
      await locker.delete('users', id);
      // Cascade delete books owned by user
      const books = await locker.getAll<Book>('books');
      const userBooks = books.filter(b => b.owner.id === id);
      for (const book of userBooks) {
        await locker.delete('books', book.id);
      }
      return delay(undefined);
    },
    updateRole: async (id: string, isAdmin: boolean): Promise<User | undefined> => {
        const users = await locker.getUsers();
        const user = users.find(u => u.id === id);
        if (user) {
            const updated = { ...user, isAdmin };
            await locker.updateUser(updated);
            return delay(updated);
        }
        return undefined;
    }
  },

  books: {
    getAll: async (): Promise<Book[]> => {
      const books = await locker.getAll<Book>('books');
      // Sort by newest by default?
      return delay(books.reverse());
    },
    
    create: async (bookData: Partial<Book>, owner: User): Promise<Book> => {
      const newBook: Book = {
        id: Math.random().toString(36).substr(2, 9),
        title: bookData.title!,
        author: bookData.author!,
        description: bookData.description!,
        price: bookData.price!,
        imageUrl: bookData.imageUrl || `https://picsum.photos/300/450?random=${Math.random()}`,
        category: bookData.category || 'Fiction',
        condition: bookData.condition as any,
        status: 'available',
        owner: owner,
        comments: []
      };
      await locker.add('books', newBook);
      return delay(newBook);
    },

    delete: async (id: string): Promise<void> => {
      await locker.delete('books', id);
      return delay(undefined);
    },

    addComment: async (bookId: string, text: string, user: User): Promise<Comment> => {
      const book = await locker.get<Book>('books', bookId);
      if (book) {
        const newComment: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            text: text,
            timestamp: new Date()
        };
        book.comments.push(newComment);
        await locker.put('books', book);
        return delay(newComment);
      }
      throw new Error("Book not found");
    }
  },

  swaps: {
    getAll: async (): Promise<Swap[]> => {
      const swaps = await locker.getAll<Swap>('swaps');
      return delay(swaps);
    },

    create: async (book: Book, requester: User, message: string, location: string): Promise<Swap> => {
      const newSwap: Swap = {
        id: Math.random().toString(36).substr(2, 9),
        bookId: book.id,
        bookTitle: book.title,
        requesterId: requester.id,
        requesterName: requester.name,
        ownerId: book.owner.id,
        status: 'pending',
        requestDate: new Date(),
        requesterMessage: message,
        requesterLocation: location
      };
      await locker.add('swaps', newSwap);
      return delay(newSwap);
    },

    updateStatus: async (swapId: string, status: 'accepted' | 'rejected'): Promise<Swap | undefined> => {
      const swap = await locker.get<Swap>('swaps', swapId);
      if (swap) {
         swap.status = status;
         await locker.put('swaps', swap);

         if (status === 'accepted') {
           const book = await locker.get<Book>('books', swap.bookId);
           if (book) {
             book.status = 'swapped';
             await locker.put('books', book);
           }
         }
         return delay(swap);
      }
      return undefined;
    }
  }
};