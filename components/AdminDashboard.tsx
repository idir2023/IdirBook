import React, { useState } from 'react';
import { User, Book } from '../types';
import { Trash2, Shield, Users, BookOpen, ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

interface AdminDashboardProps {
  users: User[];
  books: Book[];
  onDeleteUser: (userId: string) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateUserRole: (userId: string, isAdmin: boolean) => void;
  theme: 'light' | 'dark';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, books, onDeleteUser, onDeleteBook, onUpdateUserRole, theme }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'books'>('users');

  const getBookCount = (userId: string) => {
    return books.filter(b => b.owner.id === userId).length;
  };

  const swalBg = theme === 'dark' ? '#1e293b' : '#F2F0E9';
  const swalColor = theme === 'dark' ? '#fff' : '#143628';

  const confirmDeleteUser = (user: User) => {
    Swal.fire({
      title: `Ban ${user.name}?`,
      text: "This will remove the user and all their listed books permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#143628',
      confirmButtonText: 'Yes, ban user',
      background: swalBg,
      color: swalColor
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteUser(user.id);
        Swal.fire({
          title: 'Banned!',
          text: 'User has been removed.',
          icon: 'success',
          confirmButtonColor: '#143628',
          background: swalBg,
          color: swalColor,
          timer: 1500
        });
      }
    });
  };

  const confirmDeleteBook = (book: Book) => {
    Swal.fire({
      title: 'Remove Book?',
      text: `Are you sure you want to delete "${book.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#143628',
      confirmButtonText: 'Yes, delete it',
      background: swalBg,
      color: swalColor
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteBook(book.id);
        Swal.fire({
          title: 'Deleted!',
          text: 'The book has been removed.',
          icon: 'success',
          confirmButtonColor: '#143628',
          background: swalBg,
          color: swalColor,
          timer: 1500
        });
      }
    });
  };

  const confirmRoleChange = (user: User, makeAdmin: boolean) => {
    Swal.fire({
      title: makeAdmin ? 'Promote to Admin?' : 'Revoke Admin Rights?',
      text: makeAdmin 
        ? `${user.name} will have full access to manage users and books.` 
        : `${user.name} will be demoted to a standard user.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: makeAdmin ? '#143628' : '#C27803',
      cancelButtonColor: '#6b7280',
      confirmButtonText: makeAdmin ? 'Yes, promote' : 'Yes, demote',
      background: swalBg,
      color: swalColor
    }).then((result) => {
      if (result.isConfirmed) {
        onUpdateUserRole(user.id, makeAdmin);
        Swal.fire({
          title: 'Updated!',
          text: `User role has been ${makeAdmin ? 'upgraded' : 'downgraded'}.`,
          icon: 'success',
          confirmButtonColor: '#143628',
          background: swalBg,
          color: swalColor,
          timer: 1500
        });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-soft border border-gray-100 dark:border-slate-700">
        <h2 className="text-3xl font-serif font-bold text-library-navy dark:text-white mb-2 flex items-center gap-2">
            <Shield className="text-library-orange" /> Admin Portal
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Manage platform users, content moderation, and ensure community guidelines are met.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-slate-700">
        <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'users' 
                ? 'border-library-navy dark:border-library-orange text-library-navy dark:text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
        >
            <Users size={18} /> Users ({users.length})
        </button>
        <button
            onClick={() => setActiveTab('books')}
            className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'books' 
                ? 'border-library-navy dark:border-library-orange text-library-navy dark:text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
        >
            <BookOpen size={18} /> Books ({books.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-600">
                        <tr>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">User</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">Joined</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">Role</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 text-center">Books Listed</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-600" />
                                        <div>
                                            <p className="font-medium text-library-navy dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(user.joinedDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-4 text-sm">
                                    {user.isAdmin ? (
                                        <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-bold border border-purple-200 dark:border-purple-800">Admin</span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-slate-600">User</span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-center">
                                    <span className="bg-library-paper dark:bg-slate-700 px-2 py-1 rounded-md font-medium text-library-navy dark:text-white">
                                        {getBookCount(user.id)}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {user.isAdmin ? (
                                             <button 
                                                onClick={() => confirmRoleChange(user, false)}
                                                className="text-gray-400 hover:text-orange-600 p-2 rounded transition-colors hover:bg-orange-50 dark:hover:bg-slate-700"
                                                title="Revoke Admin Access"
                                            >
                                                <ShieldAlert size={16} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => confirmRoleChange(user, true)}
                                                className="text-gray-400 hover:text-green-600 p-2 rounded transition-colors hover:bg-green-50 dark:hover:bg-slate-700"
                                                title="Make Admin"
                                            >
                                                <ShieldCheck size={16} />
                                            </button>
                                        )}

                                        <button 
                                            onClick={() => confirmDeleteUser(user)}
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'books' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-600">
                        <tr>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">Book</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">Owner</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">Status</th>
                            <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {books.map(book => (
                            <tr key={book.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={book.imageUrl} alt="" className="w-8 h-12 object-cover rounded shadow-sm" />
                                        <div>
                                            <p className="font-medium text-library-navy dark:text-white line-clamp-1">{book.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{book.author}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                    {book.owner.name}
                                </td>
                                <td className="p-4 text-sm">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                                        book.status === 'available' 
                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' 
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600'
                                    }`}>
                                        {book.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => confirmDeleteBook(book)}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded transition-colors"
                                        title="Delete Book"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};