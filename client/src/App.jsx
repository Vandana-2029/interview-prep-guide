import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Sheet from './pages/Sheet.jsx';
import Prep from './pages/Prep.jsx';
import PrepReader from './pages/PrepReader.jsx';
import Resources from './pages/Resources.jsx';
import AuthPage from './pages/AuthPage.jsx';

export default function App() {
  const { user, ready } = useAuth();

  // While we check the saved token with the server, show nothing (avoids a flash of the login page)
  if (!ready) return <div className="boot">Loading your journey…</div>;

  // Not logged in: only the login and sign-up pages exist
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged in: the real app. ProgressProvider loads the sheet and this user's ticks once for every page.
  return (
    <ProgressProvider>
      <Navbar />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sheet" element={<Sheet />} />
          <Route path="/prep" element={<Prep />} />
          <Route path="/prep/:id" element={<PrepReader />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </ProgressProvider>
  );
}
