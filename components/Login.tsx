import React, { useState } from 'react';
import { Button } from './Button';
import { BookOpen, Shield, Users } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(email, password);
    setIsLoading(false);
  };

  const fillDemoCreds = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@idirbook.com');
      setPassword('admin123');
    } else {
      setEmail('eleanor@hillhouse.com');
      setPassword('user123');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-library-navy/5 text-library-navy flex items-center justify-center rounded-xl mx-auto mb-4">
            <BookOpen size={24} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-library-navy">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Sign in to continue your reading journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-library-orange focus:border-library-orange outline-none transition-all text-library-navy"
              placeholder="reader@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-library-orange focus:border-library-orange outline-none transition-all text-library-navy"
              placeholder="••••••••"
            />
          </div>

          <Button variant="action" type="submit" className="w-full py-3 text-lg" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        {/* Demo Buttons */}
        <div className="mt-6">
           <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-medium">Quick Demo Login</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <button 
                 type="button"
                 onClick={() => fillDemoCreds('admin')}
                 className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-library-navy text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-sm"
               >
                 <Shield size={14} className="text-library-orange" /> Admin Account
               </button>
               <button 
                 type="button"
                 onClick={() => fillDemoCreds('user')}
                 className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-library-navy text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-sm"
               >
                 <Users size={14} className="text-library-navy" /> User Account
               </button>
            </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 pt-6 border-t border-gray-100">
          Don't have an account?{' '}
          <button onClick={onNavigateRegister} className="text-library-orange font-bold hover:underline">
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};