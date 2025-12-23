import React, { useState } from 'react';
import { Button } from './Button';
import { BookOpen } from 'lucide-react';

interface RegisterProps {
  onRegister: (name: string, email: string, password?: string) => Promise<void>;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    await onRegister(name, email, password);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-library-orange/10 text-library-orange flex items-center justify-center rounded-xl mx-auto mb-4">
            <BookOpen size={24} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-library-navy">Join IdirBook</h2>
          <p className="text-gray-500 mt-2 text-sm">Start swapping books with the community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-library-orange focus:border-library-orange outline-none transition-all text-library-navy"
              placeholder="Eleanor Vance"
            />
          </div>
          
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-library-orange focus:border-library-orange outline-none transition-all text-library-navy"
                placeholder="••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirm</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-library-orange focus:border-library-orange outline-none transition-all text-library-navy"
                placeholder="••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs text-center bg-red-50 py-2 rounded">
              {error}
            </div>
          )}

          <Button variant="action" type="submit" className="w-full py-3 text-lg" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 pt-6 border-t border-gray-100">
          Already have an account?{' '}
          <button onClick={onNavigateLogin} className="text-library-orange font-bold hover:underline">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};