export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  password?: string; // Stored encrypted in DB, exposed for auth checks
  isAdmin?: boolean;
  joinedDate: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: Date;
}

export interface Swap {
  id: string;
  bookId: string;
  bookTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: Date;
  requesterMessage?: string;
  requesterLocation?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: string; // Estimated Value
  imageUrl: string;
  owner: User;
  comments: Comment[];
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  status: 'available' | 'swapped';
}

export type ViewState = 'marketplace' | 'dashboard' | 'login' | 'register' | 'admin' | 'profile';