import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './Admin.css';

export default function Admin() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (session === undefined) {
    return <div className="admin-page admin-checking">Checking your session&hellip;</div>;
  }

  const isAdmin = session?.user.app_metadata?.role === 'admin';

  return (
    <div className="admin-page">
      {isAdmin ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : session ? (
        <main className="admin-dashboard">
          <section className="admin-login-card">
            <h1>Admin access required</h1>
            <p>Your account is signed in but does not have the admin role.</p>
            <button className="btn btn-solid" onClick={handleLogout}>Log Out</button>
          </section>
        </main>
      ) : (
        <AdminLogin onSuccess={() => {}} />
      )}
    </div>
  );
}
