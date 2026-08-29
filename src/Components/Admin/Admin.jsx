import { useState } from 'react';
import AdminLogin, { isAdminAuthed } from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './Admin.css';

export default function Admin() {
  const [authed, setAuthed] = useState(isAdminAuthed());

  const handleLogout = () => {
    sessionStorage.removeItem('jabha_admin_authed');
    setAuthed(false);
  };

  return (
    <div className="admin-page">
      {authed ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onSuccess={() => setAuthed(true)} />
      )}
    </div>
  );
}
