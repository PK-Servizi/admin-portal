/**
 * Login Component
 * Demonstrates authentication flow with Redux state management
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices';
import { useToast } from '@/hooks';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Login mutation with automatic token storage
  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Login mutation handles token storage and state update automatically
      const result = await login({ email, password }).unwrap();
      toast.success(`Welcome back, ${result.data.user.firstName}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login to PK Servizi</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/forgot-password">Forgot password?</a>
          <a href="/register">Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
