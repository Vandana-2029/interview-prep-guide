import { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../api.js';

// AuthContext = "who is logged in", shared with every component without passing props down.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On first load: if a token is saved, ask the server whose it is
  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear()) // expired or invalid token
      .finally(() => setReady(true));
  }, []);

  async function login(email, password) {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(d.token);
    setUser(d.user);
  }

  async function register(name, email, password) {
    const d = await api('/auth/register', { method: 'POST', body: { name, email, password } });
    tokenStore.set(d.token);
    setUser(d.user);
  }

  function logout() {
    tokenStore.clear();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, ready, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
