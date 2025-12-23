import { User, Book, Swap, Comment } from '../types';

const DB_NAME = 'IdirBookLocker';
const DB_VERSION = 1;

// --- ENCRYPTION UTILS (Base64 + Salt) ---
const SALT = "IDIR_SECURE_";

const encrypt = (text: string): string => {
  try {
    return btoa(SALT + text);
  } catch (e) {
    console.error("Encryption failed", e);
    return text;
  }
};

const decrypt = (cipher: string): string => {
  try {
    const decoded = atob(cipher);
    if (decoded.startsWith(SALT)) {
      return decoded.slice(SALT.length);
    }
    return cipher; // Fallback for unencrypted/legacy data
  } catch (e) {
    console.error("Decryption failed", e);
    return cipher;
  }
};

// --- INITIAL SEED DATA ---
const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: 'Eleanor Vance',
    email: 'eleanor@hillhouse.com', 
    password: 'user123',
    avatar: 'https://picsum.photos/id/64/200/200',
    joinedDate: new Date('2023-09-15')
  },
  {
    id: 'u2',
    name: 'Julian Black',
    email: 'julian@example.com',
    password: 'user123',
    avatar: 'https://picsum.photos/id/91/200/200',
    joinedDate: new Date('2023-11-02')
  },
  {
    id: 'admin_01',
    name: 'Administrator',
    email: 'admin@idirbook.com',
    password: 'admin123',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=143628&color=fff',
    isAdmin: true,
    joinedDate: new Date('2023-01-01')
  }
];

const SEED_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'The Invisible Life of Addie LaRue',
    author: 'V.E. Schwab',
    description: 'A life no one will remember. A story you will never forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain to live forever and is cursed to be forgotten by everyone she meets.',
    price: 'Swap Only',
    imageUrl: 'https://picsum.photos/id/24/300/450',
    category: 'Fiction',
    condition: 'Like New',
    status: 'available',
    owner: SEED_USERS[1],
    comments: [
      { id: 'c1', userId: 'u3', userName: 'Sarah J.', userAvatar: '', text: 'I have a first edition of Piranesi if you are interested in a trade?', timestamp: new Date('2023-10-15') }
    ]
  },
  {
    id: 'b2',
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    price: '$25',
    imageUrl: 'https://picsum.photos/id/35/300/450',
    category: 'Science',
    condition: 'Good',
    status: 'available',
    owner: {
      id: 'u3',
      name: 'Arthur Dent',
      email: 'arthur@example.com',
      avatar: 'https://picsum.photos/id/55/200/200',
      joinedDate: new Date('2023-12-10')
    },
    comments: []
  },
  {
    id: 'b3',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    description: 'Greece in the age of heroes. Patroclus, an awkward young prince, has been exiled to the court of King Peleus and his perfect son Achilles.',
    price: '$18',
    imageUrl: 'https://picsum.photos/id/76/300/450',
    category: 'History',
    condition: 'Fair',
    status: 'available',
    owner: {
      id: 'u4',
      name: 'Circe W.',
      email: 'circe@example.com',
      avatar: 'https://picsum.photos/id/65/200/200',
      joinedDate: new Date('2024-01-05')
    },
    comments: []
  },
  {
    id: 'b4',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies.',
    price: '$20',
    imageUrl: 'https://picsum.photos/id/10/300/450',
    category: 'Non-Fiction',
    condition: 'New',
    status: 'available',
    owner: SEED_USERS[1],
    comments: []
  }
];

// --- DATABASE SERVICE CLASS ---
class StorageService {
  private db: IDBDatabase | null = null;
  private isReady: Promise<void>;

  constructor() {
    this.isReady = this.initDB();
  }

  // 1. Initialize Database & Object Stores
  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.error("Locker: Your browser doesn't support IndexedDB.");
        reject("IndexedDB not supported");
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Locker Error: Could not open database.", request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create Object Stores as requested
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('books')) {
          db.createObjectStore('books', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('swaps')) {
          db.createObjectStore('swaps', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('comments')) {
            db.createObjectStore('comments', { keyPath: 'id' });
        }
        console.log("Locker: Database setup/upgrade complete.");
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.seedDataIfEmpty(this.db!).then(() => resolve());
      };
    });
  }

  // 2. Seed Initial Data
  private async seedDataIfEmpty(db: IDBDatabase) {
    return new Promise<void>((resolve) => {
      const transaction = db.transaction(['users', 'books'], 'readwrite');
      const userStore = transaction.objectStore('users');
      const bookStore = transaction.objectStore('books');

      const countRequest = userStore.count();

      countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
          console.log("Locker: Seeding initial data...");
          
          SEED_USERS.forEach(u => userStore.add({
            ...u,
            email: encrypt(u.email),
            password: u.password ? encrypt(u.password) : undefined
          }));
          
          SEED_BOOKS.forEach(b => bookStore.add(b));
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => {
        console.error("Locker: Seeding failed", transaction.error);
        resolve(); // Resolve anyway to avoid blocking app
      };
    });
  }

  // --- GENERIC HELPERS ---

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    await this.isReady;
    if (!this.db) throw new Error("Database not initialized");
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  // --- 3. CRUD OPERATIONS ---

  async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error(`Locker Error: getAll from ${storeName} failed`, e);
      return [];
    }
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    try {
      const store = await this.getStore(storeName, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error(`Locker Error: get from ${storeName} failed`, e);
      return undefined;
    }
  }

  async add<T>(storeName: string, item: T): Promise<T> {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.add(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error(`Locker Error: add to ${storeName} failed`, e);
      throw e;
    }
  }

  async put<T>(storeName: string, item: T): Promise<T> {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error(`Locker Error: put to ${storeName} failed`, e);
      throw e;
    }
  }

  async delete(storeName: string, id: string): Promise<void> {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error(`Locker Error: delete from ${storeName} failed`, e);
      throw e;
    }
  }

  // --- SPECIFIC WRAPPERS (Encryption Handling) ---

  async getUsers(): Promise<User[]> {
    const users = await this.getAll<User>('users');
    // Decrypt credentials when reading from storage
    return users.map(u => ({ 
      ...u, 
      email: decrypt(u.email),
      password: u.password ? decrypt(u.password) : undefined
    }));
  }

  async addUser(user: User): Promise<User> {
    // Encrypt credentials before saving
    const secureUser = { 
      ...user, 
      email: encrypt(user.email),
      password: user.password ? encrypt(user.password) : undefined
    };
    await this.add('users', secureUser);
    return user;
  }

  async updateUser(user: User): Promise<User> {
    // Re-encrypt before updating
    const secureUser = { 
      ...user, 
      email: encrypt(user.email),
      password: user.password ? encrypt(user.password) : undefined
    };
    await this.put('users', secureUser);
    return user;
  }

  // --- 4. SESSION & THEME MANAGEMENT (LocalStorage) ---

  setSession(userId: string) {
    localStorage.setItem('idir_session_user', userId);
  }

  getSession(): string | null {
    return localStorage.getItem('idir_session_user');
  }

  clearSession() {
    localStorage.removeItem('idir_session_user');
  }

  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem('idir_theme', theme);
  }

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem('idir_theme') as 'light' | 'dark') || 'light';
  }
}

export const locker = new StorageService();
