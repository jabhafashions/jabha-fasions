import { useState } from 'react';

// NOTE: this is a simple front-end-only gate meant to keep casual visitors
// out of the admin page. It is NOT real security — anyone who reads the
// source can find this password. If this site ever needs real protection
// (multiple staff accounts, stricter access control, etc.) it should be
// paired with a small backend that checks credentials server-side.
const ADMIN_PASSWORD = 'jabha2026';
const SESSION_KEY = 'jabha_admin_authed';

export function isAdminAuthed() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setError('');
      onSuccess();
    } else {
      setError('That password is incorrect. Try again.');
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Enter the admin password to manage products.</p>
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="btn btn-solid">
          Log In
        </button>
      </form>
    </div>
  );
}
