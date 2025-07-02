import React, { useState, useEffect } from 'react';
import { BankingService } from './services/bankingService';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { User } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [user, setUser] = useLocalStorage<User | null>('banking_user', null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const account = BankingService.authenticate(username, password);
      
      if (account) {
        const userData: User = {
          username: account.username,
          isAuthenticated: true
        };
        setUser(userData);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }

    setLoading(false);
  };

  const handleRegister = async (username: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const success = BankingService.createAccount(username, password);
      
      if (success) {
        const userData: User = {
          username,
          isAuthenticated: true
        };
        setUser(userData);
      } else {
        setError('Username already exists. Please choose a different username.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowRegister(false);
    setError('');
  };

  if (user?.isAuthenticated) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SecureBank</h1>
          <p className="text-gray-600">Your trusted banking partner</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {showRegister ? (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => {
                setShowRegister(false);
                setError('');
              }}
              error={error}
              loading={loading}
            />
          ) : (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => {
                setShowRegister(true);
                setError('');
              }}
              error={error}
              loading={loading}
            />
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 SecureBank. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default App;