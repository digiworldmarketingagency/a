import React, { useState } from 'react';
import { UserType } from '../types';
import { Card, Button, Input } from '../components/Shared';

interface LoginProps {
  type: UserType;
  onLogin: (isAdmin?: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ type, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        setLoading(false);
        // Simple logic for demo: specific email triggers admin
        const isAdmin = type === UserType.CORPORATE && email.includes('admin');
        onLogin(isAdmin);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-extrabold text-gray-900">
             {type === UserType.CANDIDATE ? 'Candidate Login' : 'Partner Login'}
           </h2>
           <p className="mt-2 text-sm text-gray-600">
             Sign in to access your dashboard
           </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email Address" 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <div className="flex items-center justify-between text-sm">
             <a href="#" className="font-medium text-primary hover:text-teal-600">Forgot password?</a>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
             {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        {type === UserType.CORPORATE && (
           <div className="mt-4 text-center text-xs text-gray-500">
             (Tip: Use 'admin@amp.org' to see Admin Dashboard)
           </div>
        )}
      </Card>
    </div>
  );
};

export default Login;