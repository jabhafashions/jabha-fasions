import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error('Admin sign-in failed.', signInError);
        if (signInError.code === 'email_not_confirmed') {
          setError('Confirm your email address in Supabase before signing in.');
        } else if (signInError.code === 'invalid_credentials') {
          setError('The email or password is incorrect. Check your Supabase Auth user and try again.');
        } else {
          setError(signInError.message || 'Could not sign in. Please try again.');
        }
        return;
      }

      onSuccess();
    } catch (signInFailure) {
      console.error('Could not reach Supabase Auth.', signInFailure);
      setError('Could not connect to Supabase Auth. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Sign in with your admin account to manage products.</p>

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="btn btn-solid" disabled={loading}>
          {loading ? 'Signing in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
