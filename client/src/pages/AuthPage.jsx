import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// One page for both "Log in" and "Sign up"; `mode` decides which.
export default function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Controlled inputs: React state is the single source of truth for what's typed
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault(); // stop the browser's own form submit (page reload)
    setError('');
    setBusy(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="brand"><span className="bow" aria-hidden="true">♥</span><span>A2Z Journey</span></div>
        <h1 className="h-page">{isRegister ? 'Start your pink streak' : 'Welcome back'}</h1>
        <p className="muted">{isRegister ? 'Track all 495 A2Z problems and 743 interview questions.' : 'Log in to see your streak and progress.'}</p>

        {isRegister && (
          <label className="field">Name
            <input id="name" value={form.name} onChange={set('name')} autoComplete="name" required />
          </label>
        )}
        <label className="field">Email
          <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
        <label className="field">Password
          <input id="password" type="password" value={form.password} onChange={set('password')} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} required />
        </label>
        {isRegister && <div className="muted small">At least 8 characters.</div>}
        {error && <div className="error" role="alert">{error}</div>}

        <button className="btn primary block" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
        <div className="muted small center">
          {isRegister ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
        </div>
      </form>
    </div>
  );
}
